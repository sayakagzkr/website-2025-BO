const express = require('express');
const router = express.Router();
const { db } = require('../utils/database');
const { authMiddleware } = require('../middleware/auth');

// Get all customers
router.get('/', authMiddleware, (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', country = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM customers WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM customers WHERE 1=1';
    const params = [];
    const countParams = [];

    if (search) {
      query += ' AND (email LIKE ? OR full_name LIKE ? OR phone LIKE ?)';
      countQuery += ' AND (email LIKE ? OR full_name LIKE ? OR phone LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (country) {
      query += ' AND country = ?';
      countQuery += ' AND country = ?';
      params.push(country);
      countParams.push(country);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const customers = db.prepare(query).all(...params);
    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({
      customers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get customer by ID
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get customer's transactions
    const transactions = db.prepare(`
      SELECT t.*, p.name as product_name
      FROM transactions t
      LEFT JOIN products p ON t.product_id = p.id
      WHERE t.customer_id = ?
      ORDER BY t.created_at DESC
      LIMIT 10
    `).all(req.params.id);

    res.json({ ...customer, transactions });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create customer
router.post('/', authMiddleware, (req, res) => {
  try {
    const { email, full_name, country, address, phone, status = 'active' } = req.body;

    if (!email || !full_name) {
      return res.status(400).json({ error: 'Email and full name are required' });
    }

    const result = db.prepare(`
      INSERT INTO customers (email, full_name, country, address, phone, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(email, full_name, country, address, phone, status);

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(customer);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update customer
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { email, full_name, country, address, phone, status } = req.body;

    const updates = [];
    const params = [];

    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (full_name) {
      updates.push('full_name = ?');
      params.push(full_name);
    }
    if (country !== undefined) {
      updates.push('country = ?');
      params.push(country);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      params.push(address);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    db.prepare(`UPDATE customers SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    res.json(customer);
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM customers WHERE id = ?').run(id);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

module.exports = router;
