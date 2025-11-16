const express = require('express');
const router = express.Router();
const { db } = require('../utils/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Get all refunds
router.get('/', authMiddleware, (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        r.*,
        t.transaction_id,
        t.amount as transaction_amount,
        c.email as customer_email,
        c.full_name as customer_name
      FROM refunds r
      LEFT JOIN transactions t ON r.transaction_id = t.id
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM refunds WHERE 1=1';
    const params = [];
    const countParams = [];

    if (status) {
      query += ' AND r.status = ?';
      countQuery += ' AND status = ?';
      params.push(status);
      countParams.push(status);
    }

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const refunds = db.prepare(query).all(...params);
    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({
      refunds,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get refunds error:', error);
    res.status(500).json({ error: 'Failed to fetch refunds' });
  }
});

// Create refund
router.post('/', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  try {
    const { transaction_id, amount, reason, status = 'pending' } = req.body;

    if (!transaction_id || !amount) {
      return res.status(400).json({ error: 'Transaction ID and amount are required' });
    }

    const result = db.prepare(`
      INSERT INTO refunds (transaction_id, amount, reason, status)
      VALUES (?, ?, ?, ?)
    `).run(transaction_id, amount, reason, status);

    const refund = db.prepare(`
      SELECT 
        r.*,
        t.transaction_id as trans_id,
        c.email as customer_email
      FROM refunds r
      LEFT JOIN transactions t ON r.transaction_id = t.id
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE r.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(refund);
  } catch (error) {
    console.error('Create refund error:', error);
    res.status(500).json({ error: 'Failed to create refund' });
  }
});

// Update refund status
router.put('/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const processed_at = status === 'processed' ? new Date().toISOString() : null;

    db.prepare(`
      UPDATE refunds 
      SET status = ?, processed_at = ?
      WHERE id = ?
    `).run(status, processed_at, id);

    const refund = db.prepare(`
      SELECT 
        r.*,
        t.transaction_id as trans_id,
        c.email as customer_email
      FROM refunds r
      LEFT JOIN transactions t ON r.transaction_id = t.id
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE r.id = ?
    `).get(id);

    res.json(refund);
  } catch (error) {
    console.error('Update refund error:', error);
    res.status(500).json({ error: 'Failed to update refund' });
  }
});

module.exports = router;
