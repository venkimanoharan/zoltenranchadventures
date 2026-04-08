const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
  const dbState = req.app.locals.dbState || {};
  const deepCheckRequested = req.query.deep === '1' || req.query.deep === 'true';

  if (!dbState.ready) {
    return res.status(503).json({
      status: dbState.initializing ? 'starting' : 'degraded',
      error: dbState.lastError || 'Database initialization in progress',
      environment: process.env.NODE_ENV,
      initializedAt: dbState.initializedAt || null
    });
  }

  if (!deepCheckRequested) {
    return res.json({
      status: 'ok',
      environment: process.env.NODE_ENV,
      initializedAt: dbState.initializedAt || null
    });
  }

  try {
    const db = req.app.locals.db;
    const result = await db.query('SELECT NOW()');
    res.json({
      status: 'ok',
      timestamp: result.rows[0],
      environment: process.env.NODE_ENV,
      initializedAt: dbState.initializedAt || null
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      error: 'Database connection failed',
      initializedAt: dbState.initializedAt || null
    });
  }
});

module.exports = router;
