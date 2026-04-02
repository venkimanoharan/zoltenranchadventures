require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');

// Import routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const settingsRoutes = require('./routes/settings');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;

// Security and middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('../public'));

// Database connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Make pool available to routes
app.locals.db = pool;

async function ensureScheduleSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS weekly_schedule (
      id SERIAL PRIMARY KEY,
      day_of_week INTEGER NOT NULL UNIQUE CHECK (day_of_week BETWEEN 0 AND 6),
      open_time TIME,
      close_time TIME,
      max_bookings_per_hour INTEGER CHECK (max_bookings_per_hour > 0),
      trail_price DECIMAL(10, 2) CHECK (trail_price >= 0),
      is_closed BOOLEAN DEFAULT FALSE,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_by INTEGER REFERENCES admin_users(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS date_overrides (
      id SERIAL PRIMARY KEY,
      override_date DATE NOT NULL UNIQUE,
      open_time TIME,
      close_time TIME,
      max_bookings_per_hour INTEGER CHECK (max_bookings_per_hour > 0),
      trail_price DECIMAL(10, 2) CHECK (trail_price >= 0),
      is_closed BOOLEAN DEFAULT FALSE,
      notes TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_by INTEGER REFERENCES admin_users(id)
    )
  `);

  await pool.query(`
    INSERT INTO weekly_schedule (day_of_week, open_time, close_time, max_bookings_per_hour, trail_price)
    SELECT d.day_of_week, rs.open_time, rs.close_time, rs.max_bookings_per_hour, rs.trail_price
    FROM (SELECT generate_series(0, 6) AS day_of_week) d
    CROSS JOIN (SELECT open_time, close_time, max_bookings_per_hour, trail_price FROM ranch_settings ORDER BY id DESC LIMIT 1) rs
    WHERE NOT EXISTS (SELECT 1 FROM weekly_schedule)
  `);
}

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start server
async function startServer() {
  try {
    await ensureScheduleSchema();

    app.listen(PORT, () => {
      console.log(`Zolten Ranch API running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  pool.end(() => {
    console.log('Database connection pool closed');
    process.exit(0);
  });
});

module.exports = app;
