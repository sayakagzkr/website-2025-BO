const express = require('express');
const router = express.Router();
const { db } = require('../utils/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Get all affiliates
router.get('/', authMiddleware, (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, u.username, u.email 
      FROM affiliates a 
      LEFT JOIN users u ON a.user_id = u.id 
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM affiliates WHERE 1=1';
    const params = [];
    const countParams = [];

    if (search) {
      query += ' AND (a.code LIKE ? OR u.username LIKE ? OR u.email LIKE ?)';
      countQuery += ' AND code LIKE ?';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm);
    }

    query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const affiliates = db.prepare(query).all(...params);
    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({
      affiliates,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get affiliates error:', error);
    res.status(500).json({ error: 'Failed to fetch affiliates' });
  }
});

// Create affiliate
router.post('/', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  try {
    const { user_id, code, commission_rate = 10.00, status = 'active' } = req.body;

    if (!user_id || !code) {
      return res.status(400).json({ error: 'User ID and code are required' });
    }

    const result = db.prepare(`
      INSERT INTO affiliates (user_id, code, commission_rate, status)
      VALUES (?, ?, ?, ?)
    `).run(user_id, code, commission_rate, status);

    const affiliate = db.prepare(`
      SELECT a.*, u.username, u.email 
      FROM affiliates a 
      LEFT JOIN users u ON a.user_id = u.id 
      WHERE a.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(affiliate);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ error: 'Affiliate code already exists' });
    }
    console.error('Create affiliate error:', error);
    res.status(500).json({ error: 'Failed to create affiliate' });
  }
});

// Update affiliate
router.put('/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  try {
    const { id } = req.params;
    const { commission_rate, status } = req.body;

    const updates = [];
    const params = [];

    if (commission_rate !== undefined) {
      updates.push('commission_rate = ?');
      params.push(commission_rate);
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

    db.prepare(`UPDATE affiliates SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const affiliate = db.prepare(`
      SELECT a.*, u.username, u.email 
      FROM affiliates a 
      LEFT JOIN users u ON a.user_id = u.id 
      WHERE a.id = ?
    `).get(id);

    res.json(affiliate);
  } catch (error) {
    console.error('Update affiliate error:', error);
    res.status(500).json({ error: 'Failed to update affiliate' });
  }
});

// Delete affiliate
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM affiliates WHERE id = ?').run(id);
    res.json({ message: 'Affiliate deleted successfully' });
  } catch (error) {
    console.error('Delete affiliate error:', error);
    res.status(500).json({ error: 'Failed to delete affiliate' });
  }
});

module.exports = router;
