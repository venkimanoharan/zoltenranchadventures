const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { sendBookingConfirmation, sendAdminNotification } = require('../utils/emailService');
const { resolveEffectiveSettings, isTimeInWindow } = require('../utils/scheduleService');

function timeToMinutes(timeValue) {
  const raw = String(timeValue || '').slice(0, 5);
  const [h, m] = raw.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return (h * 60) + m;
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function buildRiderLoadMap(rows) {
  const load = {};

  rows.forEach((row) => {
    const riders = parseInt(row.number_of_riders, 10) || 0;
    const duration = Math.max(parseInt(row.duration_hours, 10) || 1, 1);
    const startMinutes = timeToMinutes(row.booking_time);
    if (startMinutes === null) return;

    for (let i = 0; i < duration; i++) {
      const slot = minutesToTime(startMinutes + (i * 60));
      load[slot] = (load[slot] || 0) + riders;
    }
  });

  return load;
}

// Get all bookings with filters
router.get('/', async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const db = req.app.locals.db;

    let query = 'SELECT * FROM bookings WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = $' + (params.length + 1);
      params.push(status);
    }

    if (date) {
      query += ' AND booking_date = $' + (params.length + 1);
      params.push(date);
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

// Create booking
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('booking_date').isISO8601().withMessage('Valid date is required'),
  body('booking_time').matches(/^\d{2}:\d{2}$/).withMessage('Valid time is required'),
  body('number_of_riders').isInt({ min: 1 }).withMessage('At least 1 rider required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, email, phone, booking_date, booking_time,
      special_requests, duration_hours = 1
    } = req.body;
    const riders = parseInt(req.body.number_of_riders, 10);
    const horses = riders;
    const duration = parseFloat(duration_hours) || 1;

    const db = req.app.locals.db;

    // Resolve effective settings for the requested booking date.
    const settings = await resolveEffectiveSettings(db, booking_date);
    if (settings.is_closed) {
      return res.status(400).json({ error: 'Selected date is closed for bookings' });
    }

    if (!isTimeInWindow(booking_time, settings.open_time, settings.close_time)) {
      return res.status(400).json({
        error: `Selected time is outside operating hours (${String(settings.open_time).slice(0, 5)}-${String(settings.close_time).slice(0, 5)})`
      });
    }

    if (riders > settings.max_bookings_per_hour) {
      return res.status(400).json({
        error: `This slot can host up to ${settings.max_bookings_per_hour} riders per hour. Please reduce riders or choose another slot.`
      });
    }

    const total_price = (settings.trail_price * duration * riders);

    // Check rider capacity for every hour covered by this booking duration.
    const dayBookingsResult = await db.query(
      `SELECT booking_time, duration_hours, number_of_riders
       FROM bookings
       WHERE booking_date = $1 AND status IN ('confirmed', 'pending')`,
      [booking_date]
    );

    const loadByHour = buildRiderLoadMap(dayBookingsResult.rows);
    const startMinutes = timeToMinutes(booking_time);
    const closeMinutes = timeToMinutes(settings.close_time);
    if (startMinutes === null || closeMinutes === null) {
      return res.status(400).json({ error: 'Invalid booking time' });
    }

    const endMinutes = startMinutes + (duration * 60);
    if (endMinutes > closeMinutes) {
      return res.status(400).json({
        error: `Selected duration exceeds closing time (${String(settings.close_time).slice(0, 5)}).`
      });
    }

    for (let i = 0; i < duration; i++) {
      const slot = minutesToTime(startMinutes + (i * 60));
      const ridersInSlot = loadByHour[slot] || 0;
      const remainingRiders = settings.max_bookings_per_hour - ridersInSlot;

      if (riders > remainingRiders) {
        return res.status(400).json({
          error: remainingRiders > 0
            ? `${slot} can only accommodate ${remainingRiders} more rider(s). Please select a different slot.`
            : `${slot} is full. Please select a different slot.`
        });
      }
    }

    // Insert booking
    const result = await db.query(
      `INSERT INTO bookings (
        name, email, phone, booking_date, booking_time, duration_hours,
        number_of_riders, number_of_horses, status, special_requests, total_price
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [name, email, phone, booking_date, booking_time, duration,
       riders, horses, 'pending', special_requests, total_price]
    );

    const booking = result.rows[0];

    // Fire-and-forget emails without impacting API response reliability.
    sendBookingConfirmation(booking, settings).catch((emailError) => {
      console.error('Confirmation email error:', emailError);
    });

    sendAdminNotification(booking).catch((emailError) => {
      console.error('Admin notification error:', emailError);
    });

    res.status(201).json({
      booking,
      message: 'Booking created successfully! Check your email for confirmation.'
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get single booking
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;

    const result = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ booking: result.rows[0] });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Get available time slots
router.get('/availability/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const db = req.app.locals.db;

    const settings = await resolveEffectiveSettings(db, date);
    if (settings.is_closed) {
      return res.json({
        date,
        closed: true,
        settings,
        slots: []
      });
    }

    // Get booked slots
    const bookedResult = await db.query(
      `SELECT booking_time, duration_hours, number_of_riders
       FROM bookings
       WHERE booking_date = $1 AND status IN ('confirmed', 'pending')`,
      [date]
    );

    const booked = buildRiderLoadMap(bookedResult.rows);

    // Generate available slots
    const [openHour, openMin] = settings.open_time.split(':');
    const [closeHour, closeMin] = settings.close_time.split(':');
    const slots = [];

    for (let hour = parseInt(openHour); hour < parseInt(closeHour); hour++) {
      const timeStr = String(hour).padStart(2, '0') + ':00';
      const bookedRiders = booked[timeStr] || 0;
      const remainingRiders = Math.max(settings.max_bookings_per_hour - bookedRiders, 0);
      const available = remainingRiders > 0;
      slots.push({
        time: timeStr,
        available,
        booked_riders: bookedRiders,
        remaining_riders: remainingRiders,
        max_riders_per_hour: settings.max_bookings_per_hour
      });
    }

    res.json({ slots, date, closed: false, settings });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

module.exports = router;
