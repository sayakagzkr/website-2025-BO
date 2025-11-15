const express = require('express');
const router = express.Router();
const { db } = require('../utils/database');
const { authMiddleware } = require('../middleware/auth');

// Get all content
router.get('/', authMiddleware, (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', category = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*, u.username as author_name 
      FROM content c 
      LEFT JOIN users u ON c.author_id = u.id 
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM content WHERE 1=1';
    const params = [];
    const countParams = [];

    if (search) {
      query += ' AND (c.title LIKE ? OR c.content LIKE ?)';
      countQuery += ' AND (title LIKE ? OR content LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm);
    }

    if (status) {
      query += ' AND c.status = ?';
      countQuery += ' AND status = ?';
      params.push(status);
      countParams.push(status);
    }

    if (category) {
      query += ' AND c.category = ?';
      countQuery += ' AND category = ?';
      params.push(category);
      countParams.push(category);
    }

    query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const content = db.prepare(query).all(...params);
    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({
      content,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Get content by ID
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const content = db.prepare(`
      SELECT c.*, u.username as author_name 
      FROM content c 
      LEFT JOIN users u ON c.author_id = u.id 
      WHERE c.id = ?
    `).get(req.params.id);

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json(content);
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Create content
router.post('/', authMiddleware, (req, res) => {
  try {
    const { title, slug, content, status = 'draft', category } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ error: 'Title and slug are required' });
    }

    const published_at = status === 'published' ? new Date().toISOString() : null;

    const result = db.prepare(`
      INSERT INTO content (title, slug, content, status, category, author_id, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(title, slug, content, status, category, req.user.id, published_at);

    const newContent = db.prepare(`
      SELECT c.*, u.username as author_name 
      FROM content c 
      LEFT JOIN users u ON c.author_id = u.id 
      WHERE c.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(newContent);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    console.error('Create content error:', error);
    res.status(500).json({ error: 'Failed to create content' });
  }
});

// Update content
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, content, status, category } = req.body;

    const existing = db.prepare('SELECT * FROM content WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Only author or admin can update
    if (req.user.role !== 'admin' && existing.author_id !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const updates = [];
    const params = [];

    if (title) {
      updates.push('title = ?');
      params.push(title);
    }
    if (slug) {
      updates.push('slug = ?');
      params.push(slug);
    }
    if (content !== undefined) {
      updates.push('content = ?');
      params.push(content);
    }
    if (status) {
      updates.push('status = ?');
      params.push(status);
      
      if (status === 'published' && !existing.published_at) {
        updates.push('published_at = CURRENT_TIMESTAMP');
      }
    }
    if (category !== undefined) {
      updates.push('category = ?');
      params.push(category);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    db.prepare(`UPDATE content SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updated = db.prepare(`
      SELECT c.*, u.username as author_name 
      FROM content c 
      LEFT JOIN users u ON c.author_id = u.id 
      WHERE c.id = ?
    `).get(id);

    res.json(updated);
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ error: 'Failed to update content' });
  }
});

// Delete content
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM content WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Only author or admin can delete
    if (req.user.role !== 'admin' && existing.author_id !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    db.prepare('DELETE FROM content WHERE id = ?').run(id);
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

module.exports = router;
