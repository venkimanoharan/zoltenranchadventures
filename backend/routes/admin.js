const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { sendCancellationEmail, sendRescheduleEmail } = require('../utils/emailService');
const { invalidateAvailabilityCache } = require('../utils/availabilityCache');

// Admin authentication middleware
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

router.use(verifyAdmin);

async function purgeBookingsByIds(db, bookingIds = []) {
  if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
    return { deletedCount: 0, affectedDates: [] };
  }

  const normalizedIds = [...new Set(
    bookingIds
      .map((value) => parseInt(value, 10))
      .filter((value) => Number.isInteger(value) && value > 0)
  )];

  if (normalizedIds.length === 0) {
    return { deletedCount: 0, affectedDates: [] };
  }

  const targetResult = await db.query(
    `SELECT id, booking_date
     FROM bookings
     WHERE id = ANY($1::int[])`,
    [normalizedIds]
  );

  if (targetResult.rows.length === 0) {
    return { deletedCount: 0, affectedDates: [] };
  }

  const targetIds = targetResult.rows.map((row) => row.id);
  const affectedDates = [...new Set(targetResult.rows.map((row) => String(row.booking_date).slice(0, 10)))];

  await db.query('DELETE FROM booking_history WHERE booking_id = ANY($1::int[])', [targetIds]);
  await db.query('DELETE FROM booking_add_ons WHERE booking_id = ANY($1::int[])', [targetIds]);
  const deleteResult = await db.query('DELETE FROM bookings WHERE id = ANY($1::int[])', [targetIds]);

  affectedDates.forEach((date) => invalidateAvailabilityCache(date));

  return {
    deletedCount: deleteResult.rowCount || 0,
    affectedDates,
  };
}

// Get all bookings (admin only)
router.get('/bookings', async (req, res) => {
  try {
    const { status, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const db = req.app.locals.db;

    let query = 'SELECT * FROM bookings WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = $' + (params.length + 1);
      params.push(status);
    }

    if (dateFrom) {
      query += ' AND booking_date >= $' + (params.length + 1);
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND booking_date <= $' + (params.length + 1);
      params.push(dateTo);
    }

    // Get total count
    const countResult = await db.query(query.replace('SELECT *', 'SELECT COUNT(*)'), params);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    query += ' ORDER BY booking_date DESC, booking_time DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      bookings: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.post('/bookings/purge/selected', async (req, res) => {
  const db = req.app.locals.db;

  try {
    const { bookingIds } = req.body || {};

    if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json({ error: 'bookingIds array is required' });
    }

    await db.query('BEGIN');
    const result = await purgeBookingsByIds(db, bookingIds);
    await db.query('COMMIT');

    return res.json({
      message: `Purged ${result.deletedCount} booking(s)`,
      deletedCount: result.deletedCount,
      affectedDates: result.affectedDates,
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Purge selected bookings error:', error);
    return res.status(500).json({ error: 'Failed to purge selected bookings' });
  }
});

router.post('/bookings/purge/older-than', async (req, res) => {
  const db = req.app.locals.db;

  try {
    const rawDays = req.body?.days;
    const days = parseInt(rawDays, 10);

    if (!Number.isInteger(days) || days < 1 || days > 3650) {
      return res.status(400).json({ error: 'days must be an integer between 1 and 3650' });
    }

    const targetResult = await db.query(
      `SELECT id
       FROM bookings
       WHERE booking_date < CURRENT_DATE - ($1 * INTERVAL '1 day')`,
      [days]
    );

    const targetIds = targetResult.rows.map((row) => row.id);

    if (targetIds.length === 0) {
      return res.json({
        message: 'No bookings matched the purge criteria',
        deletedCount: 0,
        affectedDates: [],
      });
    }

    await db.query('BEGIN');
    const result = await purgeBookingsByIds(db, targetIds);
    await db.query('COMMIT');

    return res.json({
      message: `Purged ${result.deletedCount} booking(s) older than ${days} day(s)`,
      deletedCount: result.deletedCount,
      affectedDates: result.affectedDates,
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Purge old bookings error:', error);
    return res.status(500).json({ error: 'Failed to purge old bookings' });
  }
});

// Confirm booking
router.put('/bookings/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;

    const result = await db.query(
      `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      ['confirmed', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Log the change
    await db.query(
      `INSERT INTO booking_history (booking_id, action, old_status, new_status, changed_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, 'confirmed', 'pending', 'confirmed', req.user.id, 'Booking confirmed by admin']
    );

    invalidateAvailabilityCache(result.rows[0].booking_date);

    res.json({ booking: result.rows[0], message: 'Booking confirmed' });
  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({ error: 'Failed to confirm booking' });
  }
});

// Cancel booking
router.put('/bookings/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const db = req.app.locals.db;

    // Get current booking to get old status
    const currentBooking = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (currentBooking.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const oldStatus = currentBooking.rows[0].status;

    const result = await db.query(
      `UPDATE bookings SET status = $1, updated_at = NOW(), cancelled_reason = $2, cancelled_at = NOW() 
       WHERE id = $3 RETURNING *`,
      ['cancelled', reason || '', id]
    );

    // Log the change
    await db.query(
      `INSERT INTO booking_history (booking_id, action, old_status, new_status, changed_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, 'cancelled', oldStatus, 'cancelled', req.user.id, reason || 'Booking cancelled by admin']
    );

    // Send cancellation email to customer
    sendCancellationEmail(currentBooking.rows[0]);

    invalidateAvailabilityCache(result.rows[0].booking_date);

    res.json({ booking: result.rows[0], message: 'Booking cancelled and customer notified' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Reschedule booking
router.put('/bookings/:id/reschedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { booking_date, booking_time } = req.body;
    const db = req.app.locals.db;

    if (!booking_date || !booking_time) {
      return res.status(400).json({ error: 'Date and time are required' });
    }

    // Get current booking
    const currentBooking = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (currentBooking.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check availability
    const settingsResult = await db.query('SELECT * FROM ranch_settings LIMIT 1');
    const settings = settingsResult.rows[0];

    const availabilityResult = await db.query(
      `SELECT COUNT(*) as count FROM bookings 
       WHERE booking_date = $1 AND booking_time = $2 AND status IN ('confirmed', 'pending') AND id != $3`,
      [booking_date, booking_time, id]
    );

    if (parseInt(availabilityResult.rows[0].count) >= settings.max_bookings_per_hour) {
      return res.status(400).json({ error: 'New time slot is fully booked' });
    }

    const oldTime = currentBooking.rows[0].booking_date + ' ' + currentBooking.rows[0].booking_time;

    const result = await db.query(
      `UPDATE bookings SET booking_date = $1, booking_time = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [booking_date, booking_time, id]
    );

    // Log the change
    await db.query(
      `INSERT INTO booking_history (booking_id, action, old_status, new_status, changed_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, 'rescheduled', currentBooking.rows[0].status, currentBooking.rows[0].status, req.user.id, 
       `Rescheduled from ${oldTime} to ${booking_date} ${booking_time}`]
    );

    // Send reschedule email to customer
    sendRescheduleEmail(currentBooking.rows[0], booking_date, booking_time);

    invalidateAvailabilityCache(currentBooking.rows[0].booking_date);
    invalidateAvailabilityCache(booking_date);

    res.json({ booking: result.rows[0], message: 'Booking rescheduled and customer notified' });
  } catch (error) {
    console.error('Reschedule booking error:', error);
    res.status(500).json({ error: 'Failed to reschedule booking' });
  }
});

// Get booking statistics
router.get('/stats', async (req, res) => {
  try {
    const db = req.app.locals.db;

    const statsResult = await db.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM bookings
      WHERE booking_date >= CURRENT_DATE
      GROUP BY status
    `);

    const totalResult = await db.query('SELECT COUNT(*) as total FROM bookings WHERE booking_date >= CURRENT_DATE');
    const todayResult = await db.query('SELECT COUNT(*) as total FROM bookings WHERE booking_date = CURRENT_DATE');

    const stats = {
      total: parseInt(totalResult.rows[0].total),
      today: parseInt(todayResult.rows[0].total),
      byStatus: {}
    };

    statsResult.rows.forEach(row => {
      stats.byStatus[row.status] = parseInt(row.count);
    });

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
