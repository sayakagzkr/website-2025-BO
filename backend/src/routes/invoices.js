const express = require('express');
const router = express.Router();
const { db } = require('../utils/database');
const { authMiddleware } = require('../middleware/auth');

// Get all invoices
router.get('/', authMiddleware, (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        i.*,
        c.email as customer_email,
        c.full_name as customer_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM invoices WHERE 1=1';
    const params = [];
    const countParams = [];

    if (status) {
      query += ' AND i.status = ?';
      countQuery += ' AND status = ?';
      params.push(status);
      countParams.push(status);
    }

    query += ' ORDER BY i.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const invoices = db.prepare(query).all(...params);
    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({
      invoices,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Create invoice
router.post('/', authMiddleware, (req, res) => {
  try {
    const { invoice_number, transaction_id, customer_id, amount, due_date, status = 'unpaid' } = req.body;

    if (!invoice_number || !customer_id || !amount) {
      return res.status(400).json({ error: 'Invoice number, customer, and amount are required' });
    }

    const result = db.prepare(`
      INSERT INTO invoices (invoice_number, transaction_id, customer_id, amount, due_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(invoice_number, transaction_id, customer_id, amount, due_date, status);

    const invoice = db.prepare(`
      SELECT 
        i.*,
        c.email as customer_email,
        c.full_name as customer_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(invoice);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ error: 'Invoice number already exists' });
    }
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Update invoice
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const paid_at = status === 'paid' ? new Date().toISOString() : null;

    db.prepare(`
      UPDATE invoices 
      SET status = ?, paid_at = ?
      WHERE id = ?
    `).run(status, paid_at, id);

    const invoice = db.prepare(`
      SELECT 
        i.*,
        c.email as customer_email,
        c.full_name as customer_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ?
    `).get(id);

    res.json(invoice);
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

module.exports = router;
