const express = require('express');
const router = express.Router();
const { db } = require('../utils/database');
const { authMiddleware } = require('../middleware/auth');

// Get all transactions
router.get('/', authMiddleware, (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', country = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        t.*,
        c.email as customer_email,
        c.full_name as customer_name,
        p.name as product_name,
        a.code as affiliate_code
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN products p ON t.product_id = p.id
      LEFT JOIN affiliates a ON t.affiliate_id = a.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM transactions WHERE 1=1';
    const params = [];
    const countParams = [];

    if (search) {
      query += ' AND (t.transaction_id LIKE ? OR c.email LIKE ? OR c.full_name LIKE ?)';
      countQuery += ' AND transaction_id LIKE ?';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm);
    }

    if (status) {
      query += ' AND t.status = ?';
      countQuery += ' AND status = ?';
      params.push(status);
      countParams.push(status);
    }

    if (country) {
      query += ' AND t.country = ?';
      countQuery += ' AND country = ?';
      params.push(country);
      countParams.push(country);
    }

    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const transactions = db.prepare(query).all(...params);
    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get transaction by ID
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const transaction = db.prepare(`
      SELECT 
        t.*,
        c.email as customer_email,
        c.full_name as customer_name,
        c.country as customer_country,
        p.name as product_name,
        p.price as product_price,
        a.code as affiliate_code
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN products p ON t.product_id = p.id
      LEFT JOIN affiliates a ON t.affiliate_id = a.id
      WHERE t.id = ?
    `).get(req.params.id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Create transaction
router.post('/', authMiddleware, (req, res) => {
  try {
    const {
      transaction_id,
      customer_id,
      affiliate_id,
      product_id,
      amount,
      commission = 0,
      status = 'pending',
      payment_method,
      card_bin,
      country
    } = req.body;

    if (!transaction_id || !customer_id || !product_id || !amount) {
      return res.status(400).json({ error: 'Transaction ID, customer, product, and amount are required' });
    }

    const result = db.prepare(`
      INSERT INTO transactions (
        transaction_id, customer_id, affiliate_id, product_id, 
        amount, commission, status, payment_method, card_bin, country
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      transaction_id, customer_id, affiliate_id, product_id,
      amount, commission, status, payment_method, card_bin, country
    );

    // Update affiliate stats if applicable
    if (affiliate_id && commission > 0) {
      db.prepare(`
        UPDATE affiliates 
        SET total_sales = total_sales + ?,
            total_commission = total_commission + ?
        WHERE id = ?
      `).run(amount, commission, affiliate_id);
    }

    const transaction = db.prepare(`
      SELECT 
        t.*,
        c.email as customer_email,
        c.full_name as customer_name,
        p.name as product_name,
        a.code as affiliate_code
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN products p ON t.product_id = p.id
      LEFT JOIN affiliates a ON t.affiliate_id = a.id
      WHERE t.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(transaction);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ error: 'Transaction ID already exists' });
    }
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Update transaction status
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    db.prepare('UPDATE transactions SET status = ? WHERE id = ?').run(status, id);

    const transaction = db.prepare(`
      SELECT 
        t.*,
        c.email as customer_email,
        c.full_name as customer_name,
        p.name as product_name,
        a.code as affiliate_code
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN products p ON t.product_id = p.id
      LEFT JOIN affiliates a ON t.affiliate_id = a.id
      WHERE t.id = ?
    `).get(id);

    res.json(transaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

module.exports = router;
