const express = require('express');
const jwt = require('jsonwebtoken');
const {
  getPricingCatalog,
} = require('../utils/pricingService');

const router = express.Router();

function verifyAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

router.get('/', async (req, res) => {
  try {
    const catalog = await getPricingCatalog(req.app.locals.db);
    res.json(catalog);
  } catch (error) {
    console.error('Get pricing catalog error:', error);
    res.status(500).json({ error: 'Failed to fetch pricing catalog' });
  }
});

router.use(verifyAdmin);

router.put('/packages', async (req, res) => {
  try {
    const updates = {
      package_price_1h: req.body.package_price_1h,
      package_price_2h: req.body.package_price_2h,
      package_price_4h: req.body.package_price_4h,
      package_price_8h: req.body.package_price_8h,
    };

    const updateFields = [];
    const updateValues = [];
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue) || numericValue < 0) {
          throw new Error(`Invalid value for ${key}`);
        }
        updateValues.push(numericValue);
        updateFields.push(`${key} = $${updateValues.length}`);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No package prices supplied' });
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(req.user.id);
    updateFields.push(`updated_by = $${updateValues.length}`);

    const query = `UPDATE ranch_settings SET ${updateFields.join(', ')} RETURNING *`;
    const result = await req.app.locals.db.query(query, updateValues);

    res.json({ settings: result.rows[0], message: 'Package pricing updated' });
  } catch (error) {
    console.error('Update package pricing error:', error);
    res.status(error.message.startsWith('Invalid value') ? 400 : 500).json({ error: error.message || 'Failed to update package pricing' });
  }
});

router.post('/addons', async (req, res) => {
  try {
    const {
      code,
      name,
      name_es,
      description,
      description_es,
      price,
      charge_type = 'per_booking',
      icon = '✨',
      display_order = 0,
      is_active = true,
    } = req.body;

    if (!code || !name) {
      return res.status(400).json({ error: 'code and name are required' });
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ error: 'price must be a positive number' });
    }

    const result = await req.app.locals.db.query(
      `INSERT INTO pricing_addons (code, name, name_es, description, description_es, price, charge_type, icon, display_order, is_active, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING *`,
      [code, name, name_es || null, description || null, description_es || null, numericPrice, charge_type, icon || '✨', Number(display_order) || 0, Boolean(is_active)]
    );

    res.status(201).json({ add_on: result.rows[0], message: 'Add-on created' });
  } catch (error) {
    console.error('Create add-on error:', error);
    res.status(500).json({ error: 'Failed to create add-on' });
  }
});

router.put('/addons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      name,
      name_es,
      description,
      description_es,
      price,
      charge_type,
      icon,
      display_order,
      is_active,
    } = req.body;

    const result = await req.app.locals.db.query(
      `UPDATE pricing_addons
       SET code = $1,
           name = $2,
           name_es = $3,
           description = $4,
           description_es = $5,
           price = $6,
           charge_type = $7,
           icon = $8,
           display_order = $9,
           is_active = $10,
           updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        code,
        name,
        name_es || null,
        description || null,
        description_es || null,
        Number(price),
        charge_type,
        icon || '✨',
        Number(display_order) || 0,
        Boolean(is_active),
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Add-on not found' });
    }

    res.json({ add_on: result.rows[0], message: 'Add-on updated' });
  } catch (error) {
    console.error('Update add-on error:', error);
    res.status(500).json({ error: 'Failed to update add-on' });
  }
});

router.delete('/addons/:id', async (req, res) => {
  try {
    const result = await req.app.locals.db.query('DELETE FROM pricing_addons WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Add-on not found' });
    }
    res.json({ message: 'Add-on deleted' });
  } catch (error) {
    console.error('Delete add-on error:', error);
    res.status(500).json({ error: 'Failed to delete add-on' });
  }
});

router.post('/discounts', async (req, res) => {
  try {
    const { min_riders, max_riders = null, discount_percent, description, description_es, display_order = 0, is_active = true } = req.body;
    const result = await req.app.locals.db.query(
      `INSERT INTO group_discounts (min_riders, max_riders, discount_percent, description, description_es, display_order, is_active, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [Number(min_riders), max_riders === null || max_riders === '' ? null : Number(max_riders), Number(discount_percent), description || null, description_es || null, Number(display_order) || 0, Boolean(is_active)]
    );
    res.status(201).json({ discount: result.rows[0], message: 'Discount created' });
  } catch (error) {
    console.error('Create discount error:', error);
    res.status(500).json({ error: 'Failed to create discount' });
  }
});

router.put('/discounts/:id', async (req, res) => {
  try {
    const { min_riders, max_riders = null, discount_percent, description, description_es, display_order = 0, is_active = true } = req.body;
    const result = await req.app.locals.db.query(
      `UPDATE group_discounts
       SET min_riders = $1,
           max_riders = $2,
           discount_percent = $3,
           description = $4,
           description_es = $5,
           display_order = $6,
           is_active = $7,
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [Number(min_riders), max_riders === null || max_riders === '' ? null : Number(max_riders), Number(discount_percent), description || null, description_es || null, Number(display_order) || 0, Boolean(is_active), req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Discount not found' });
    }

    res.json({ discount: result.rows[0], message: 'Discount updated' });
  } catch (error) {
    console.error('Update discount error:', error);
    res.status(500).json({ error: 'Failed to update discount' });
  }
});

router.delete('/discounts/:id', async (req, res) => {
  try {
    const result = await req.app.locals.db.query('DELETE FROM group_discounts WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Discount not found' });
    }
    res.json({ message: 'Discount deleted' });
  } catch (error) {
    console.error('Delete discount error:', error);
    res.status(500).json({ error: 'Failed to delete discount' });
  }
});

module.exports = router;
