const express = require('express');
const router = express.Router();
const { db } = require('../utils/database');
const { authMiddleware } = require('../middleware/auth');

// Get download logs
router.get('/downloads', authMiddleware, (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const logs = db.prepare(`
      SELECT 
        dl.*,
        c.email as customer_email,
        c.full_name as customer_name,
        p.name as product_name,
        t.transaction_id
      FROM download_logs dl
      LEFT JOIN customers c ON dl.customer_id = c.id
      LEFT JOIN products p ON dl.product_id = p.id
      LEFT JOIN transactions t ON dl.transaction_id = t.id
      ORDER BY dl.created_at DESC
      LIMIT ? OFFSET ?
    `).all(parseInt(limit), offset);

    const { total } = db.prepare('SELECT COUNT(*) as total FROM download_logs').get();

    res.json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get download logs error:', error);
    res.status(500).json({ error: 'Failed to fetch download logs' });
  }
});

// Log download
router.post('/downloads', authMiddleware, (req, res) => {
  try {
    const { customer_id, product_id, transaction_id, ip_address } = req.body;

    if (!customer_id || !product_id) {
      return res.status(400).json({ error: 'Customer ID and product ID are required' });
    }

    const result = db.prepare(`
      INSERT INTO download_logs (customer_id, product_id, transaction_id, ip_address)
      VALUES (?, ?, ?, ?)
    `).run(customer_id, product_id, transaction_id, ip_address);

    res.status(201).json({ id: result.lastInsertRowid, message: 'Download logged' });
  } catch (error) {
    console.error('Log download error:', error);
    res.status(500).json({ error: 'Failed to log download' });
  }
});

// Get mail logs
router.get('/mail', authMiddleware, (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const logs = db.prepare(`
      SELECT *
      FROM mail_logs
      ORDER BY sent_at DESC
      LIMIT ? OFFSET ?
    `).all(parseInt(limit), offset);

    const { total } = db.prepare('SELECT COUNT(*) as total FROM mail_logs').get();

    res.json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get mail logs error:', error);
    res.status(500).json({ error: 'Failed to fetch mail logs' });
  }
});

// Log mail
router.post('/mail', authMiddleware, (req, res) => {
  try {
    const { recipient, subject, body, status = 'sent' } = req.body;

    if (!recipient || !subject) {
      return res.status(400).json({ error: 'Recipient and subject are required' });
    }

    const result = db.prepare(`
      INSERT INTO mail_logs (recipient, subject, body, status)
      VALUES (?, ?, ?, ?)
    `).run(recipient, subject, body, status);

    res.status(201).json({ id: result.lastInsertRowid, message: 'Mail logged' });
  } catch (error) {
    console.error('Log mail error:', error);
    res.status(500).json({ error: 'Failed to log mail' });
  }
});

module.exports = router;
