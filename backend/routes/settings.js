const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { getBaseSettings, resolveEffectiveSettings } = require('../utils/scheduleService');

const toDbTime = (value) => {
  if (!value) return null;
  if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`;
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value;
  return null;
};

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

// Get settings (public read for displaying hours)
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { date } = req.query;

    if (date) {
      const effective = await resolveEffectiveSettings(db, date);
      return res.json({ settings: effective, source: effective.source, date });
    }

    const settings = await getBaseSettings(db);
    res.json({ settings, source: 'global' });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Get effective settings for a specific date (public)
router.get('/effective/:date', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const effective = await resolveEffectiveSettings(db, req.params.date);
    res.json({ settings: effective, source: effective.source, date: req.params.date });
  } catch (error) {
    console.error('Get effective settings error:', error);
    res.status(500).json({ error: 'Failed to fetch effective settings' });
  }
});

// Get weekly schedule (public)
router.get('/schedule/weekly', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query('SELECT * FROM weekly_schedule ORDER BY day_of_week ASC');
    res.json({ weekly: result.rows });
  } catch (error) {
    console.error('Get weekly schedule error:', error);
    res.status(500).json({ error: 'Failed to fetch weekly schedule' });
  }
});

// Get closed dates in a range (public)
router.get('/closed-dates', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'from and to query params are required (YYYY-MM-DD)' });
    }

    const start = new Date(`${from}T00:00:00`);
    const end = new Date(`${to}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
      return res.status(400).json({ error: 'Invalid date range' });
    }

    const closed_dates = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      const dateStr = cursor.toISOString().slice(0, 10);
      // eslint-disable-next-line no-await-in-loop
      const effective = await resolveEffectiveSettings(db, dateStr);
      if (effective.is_closed) {
        closed_dates.push(dateStr);
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    res.json({ from, to, closed_dates });
  } catch (error) {
    console.error('Get closed dates error:', error);
    res.status(500).json({ error: 'Failed to fetch closed dates' });
  }
});

// Update settings (admin only)
router.use(verifyAdmin);

router.put('/', async (req, res) => {
  try {
    const {
      open_time,
      close_time,
      max_bookings_per_hour,
      trail_price,
      contact_phone,
      contact_email,
      booking_email,
      street_address,
      city,
      state,
      postal_code,
      hours_note,
      holiday_hours,
    } = req.body;

    const db = req.app.locals.db;

    const normalizedOpen = toDbTime(open_time);
    const normalizedClose = toDbTime(close_time);

    // Validate inputs
    if (open_time && !normalizedOpen) {
      return res.status(400).json({ error: 'Invalid open_time format (HH:MM:SS)' });
    }

    if (close_time && !normalizedClose) {
      return res.status(400).json({ error: 'Invalid close_time format (HH:MM:SS)' });
    }

    if (max_bookings_per_hour !== undefined && max_bookings_per_hour < 1) {
      return res.status(400).json({ error: 'Max bookings must be at least 1' });
    }

    if (trail_price !== undefined && trail_price < 0) {
      return res.status(400).json({ error: 'Price cannot be negative' });
    }

    if (contact_email !== undefined && contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
      return res.status(400).json({ error: 'Invalid contact email address' });
    }

    if (booking_email !== undefined && booking_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking_email)) {
      return res.status(400).json({ error: 'Invalid booking email address' });
    }

    const updateFields = [];
    const updateParams = [];
    let paramIndex = 1;

    if (open_time) {
      updateFields.push(`open_time = $${paramIndex}`);
      updateParams.push(normalizedOpen);
      paramIndex++;
    }

    if (close_time) {
      updateFields.push(`close_time = $${paramIndex}`);
      updateParams.push(normalizedClose);
      paramIndex++;
    }

    if (max_bookings_per_hour !== undefined) {
      updateFields.push(`max_bookings_per_hour = $${paramIndex}`);
      updateParams.push(max_bookings_per_hour);
      paramIndex++;
    }

    if (trail_price !== undefined) {
      updateFields.push(`trail_price = $${paramIndex}`);
      updateParams.push(trail_price);
      paramIndex++;
    }

    const stringFields = [
      ['contact_phone', contact_phone],
      ['contact_email', contact_email],
      ['booking_email', booking_email],
      ['street_address', street_address],
      ['city', city],
      ['state', state],
      ['postal_code', postal_code],
      ['hours_note', hours_note],
      ['holiday_hours', holiday_hours],
    ];

    stringFields.forEach(([fieldName, value]) => {
      if (value !== undefined) {
        updateFields.push(`${fieldName} = $${paramIndex}`);
        updateParams.push(value || null);
        paramIndex++;
      }
    });

    updateFields.push(`updated_at = NOW()`);
    updateFields.push(`updated_by = $${paramIndex}`);
    updateParams.push(req.user.id);

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const query = `UPDATE ranch_settings SET ${updateFields.join(', ')} RETURNING *`;
    const result = await db.query(query, updateParams);

    res.json({
      settings: result.rows[0],
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

router.put('/schedule/weekly/:day', async (req, res) => {
  try {
    const day = parseInt(req.params.day, 10);
    if (Number.isNaN(day) || day < 0 || day > 6) {
      return res.status(400).json({ error: 'Day must be between 0 (Sun) and 6 (Sat)' });
    }

    const {
      open_time, close_time, max_bookings_per_hour, trail_price, is_closed = false
    } = req.body;

    const normalizedOpen = toDbTime(open_time);
    const normalizedClose = toDbTime(close_time);
    if (open_time && !normalizedOpen) return res.status(400).json({ error: 'Invalid open_time format' });
    if (close_time && !normalizedClose) return res.status(400).json({ error: 'Invalid close_time format' });

    const db = req.app.locals.db;
    const result = await db.query(
      `INSERT INTO weekly_schedule (
         day_of_week, open_time, close_time, max_bookings_per_hour, trail_price, is_closed, updated_at, updated_by
       ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
       ON CONFLICT (day_of_week) DO UPDATE SET
         open_time = EXCLUDED.open_time,
         close_time = EXCLUDED.close_time,
         max_bookings_per_hour = EXCLUDED.max_bookings_per_hour,
         trail_price = EXCLUDED.trail_price,
         is_closed = EXCLUDED.is_closed,
         updated_at = NOW(),
         updated_by = EXCLUDED.updated_by
       RETURNING *`,
      [
        day,
        normalizedOpen,
        normalizedClose,
        max_bookings_per_hour,
        trail_price,
        Boolean(is_closed),
        req.user.id,
      ]
    );

    res.json({ schedule: result.rows[0], message: 'Weekly schedule updated' });
  } catch (error) {
    console.error('Update weekly schedule error:', error);
    res.status(500).json({ error: 'Failed to update weekly schedule' });
  }
});

// Date override APIs
router.get('/schedule/overrides', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { from, to } = req.query;
    const clauses = [];
    const params = [];

    if (from) {
      clauses.push(`override_date >= $${params.length + 1}`);
      params.push(from);
    }
    if (to) {
      clauses.push(`override_date <= $${params.length + 1}`);
      params.push(to);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const result = await db.query(
      `SELECT * FROM date_overrides ${where} ORDER BY override_date ASC`,
      params
    );

    res.json({ overrides: result.rows });
  } catch (error) {
    console.error('Get date overrides error:', error);
    res.status(500).json({ error: 'Failed to fetch date overrides' });
  }
});

router.post('/schedule/overrides', async (req, res) => {
  try {
    const {
      override_date,
      open_time,
      close_time,
      max_bookings_per_hour,
      trail_price,
      is_closed = false,
      notes,
    } = req.body;

    if (!override_date) {
      return res.status(400).json({ error: 'override_date is required' });
    }

    const normalizedOpen = toDbTime(open_time);
    const normalizedClose = toDbTime(close_time);
    if (open_time && !normalizedOpen) return res.status(400).json({ error: 'Invalid open_time format' });
    if (close_time && !normalizedClose) return res.status(400).json({ error: 'Invalid close_time format' });

    const db = req.app.locals.db;
    const result = await db.query(
      `INSERT INTO date_overrides (
         override_date, open_time, close_time, max_bookings_per_hour, trail_price, is_closed, notes, updated_at, updated_by
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
       ON CONFLICT (override_date) DO UPDATE SET
         open_time = EXCLUDED.open_time,
         close_time = EXCLUDED.close_time,
         max_bookings_per_hour = EXCLUDED.max_bookings_per_hour,
         trail_price = EXCLUDED.trail_price,
         is_closed = EXCLUDED.is_closed,
         notes = EXCLUDED.notes,
         updated_at = NOW(),
         updated_by = EXCLUDED.updated_by
       RETURNING *`,
      [
        override_date,
        normalizedOpen,
        normalizedClose,
        max_bookings_per_hour,
        trail_price,
        Boolean(is_closed),
        notes || null,
        req.user.id,
      ]
    );

    res.status(201).json({ override: result.rows[0], message: 'Date override saved' });
  } catch (error) {
    console.error('Save date override error:', error);
    res.status(500).json({ error: 'Failed to save date override' });
  }
});

router.delete('/schedule/overrides/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    await db.query('DELETE FROM date_overrides WHERE id = $1', [req.params.id]);
    res.json({ message: 'Date override deleted' });
  } catch (error) {
    console.error('Delete date override error:', error);
    res.status(500).json({ error: 'Failed to delete date override' });
  }
});

module.exports = router;
