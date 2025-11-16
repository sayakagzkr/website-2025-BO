const express = require('express');
const router = express.Router();
const { db } = require('../utils/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Get all products
router.get('/', authMiddleware, (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category_id = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
    const params = [];
    const countParams = [];

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      countQuery += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm);
    }

    if (category_id) {
      query += ' AND p.category_id = ?';
      countQuery += ' AND category_id = ?';
      params.push(category_id);
      countParams.push(category_id);
    }

    if (status) {
      query += ' AND p.status = ?';
      countQuery += ' AND status = ?';
      params.push(status);
      countParams.push(status);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const products = db.prepare(query).all(...params);
    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const product = db.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `).get(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product
router.post('/', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  try {
    const { name, slug, description, price, category_id, image_url, stock = 0, status = 'active' } = req.body;

    if (!name || !slug || !price) {
      return res.status(400).json({ error: 'Name, slug, and price are required' });
    }

    const result = db.prepare(`
      INSERT INTO products (name, slug, description, price, category_id, image_url, stock, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, slug, description, price, category_id, image_url, stock, status);

    const product = db.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(product);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ error: 'Product slug already exists' });
    }
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, price, category_id, image_url, stock, status } = req.body;

    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (slug) {
      updates.push('slug = ?');
      params.push(slug);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (price) {
      updates.push('price = ?');
      params.push(price);
    }
    if (category_id !== undefined) {
      updates.push('category_id = ?');
      params.push(category_id);
    }
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      params.push(image_url);
    }
    if (stock !== undefined) {
      updates.push('stock = ?');
      params.push(stock);
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

    db.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const product = db.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `).get(id);

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
