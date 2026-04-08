require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Import routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const pricingRoutes = require('./routes/pricing');
const settingsRoutes = require('./routes/settings');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_INIT_RETRY_DELAY_MS = 5000;
const DB_CONNECTION_TIMEOUT_MS = Number(process.env.DB_CONNECTION_TIMEOUT_MS || 10000);

function resolvePublicDir() {
  const publicDir = path.join(__dirname, '..', 'public');

  if (fs.existsSync(publicDir)) {
    return publicDir;
  }

  return path.join(__dirname, 'public');
}

// Security and middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(resolvePublicDir()));

// Database connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: DB_CONNECTION_TIMEOUT_MS,
});

// Make pool available to routes
app.locals.db = pool;
app.locals.dbState = {
  ready: false,
  initializing: false,
  lastError: null,
  initializedAt: null,
};

function databaseUnavailablePayload() {
  return {
    error: 'Database initialization in progress',
    status: 503,
    details: app.locals.dbState.lastError || null
  };
}

function requireDatabaseReady(req, res, next) {
  if (req.app.locals.dbState.ready) {
    return next();
  }

  return res.status(503).json(databaseUnavailablePayload());
}

async function initializeDatabase() {
  const dbState = app.locals.dbState;

  if (dbState.ready || dbState.initializing) {
    return;
  }

  dbState.initializing = true;

  try {
    const initSqlPath = path.join(__dirname, 'init.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf8');

    await pool.query(initSql);

    dbState.ready = true;
    dbState.lastError = null;
    dbState.initializedAt = new Date().toISOString();
    console.log('Database schema initialized successfully');
  } catch (error) {
    dbState.ready = false;
    dbState.lastError = error.message;
    console.error('Database initialization failed:', error);
    setTimeout(() => {
      initializeDatabase().catch((retryError) => {
        console.error('Database retry scheduling failed:', retryError);
      });
    }, DB_INIT_RETRY_DELAY_MS);
  } finally {
    dbState.initializing = false;
  }
}

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', requireDatabaseReady, authRoutes);
app.use('/api/bookings', requireDatabaseReady, bookingRoutes);
app.use('/api/admin', requireDatabaseReady, adminRoutes);
app.use('/api/pricing', requireDatabaseReady, pricingRoutes);
app.use('/api/settings', requireDatabaseReady, settingsRoutes);

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
    app.listen(PORT, () => {
      console.log(`Zolten Ranch API running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      initializeDatabase().catch((error) => {
        console.error('Unexpected database initialization error:', error);
      });
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
