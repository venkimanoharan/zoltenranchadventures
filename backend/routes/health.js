const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query('SELECT NOW()');
    res.json({
      status: 'ok',
      timestamp: result.rows[0],
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      error: 'Database connection failed'
    });
  }
});

module.exports = router;
