const express = require('express');
const router = express.Router();
const { db } = require('../utils/database');
const { authMiddleware } = require('../middleware/auth');

// Get dashboard statistics
router.get('/dashboard', authMiddleware, (req, res) => {
  try {
    // Total users
    const { totalUsers } = db.prepare('SELECT COUNT(*) as totalUsers FROM users').get();
    
    // Active users (last 30 days)
    const { activeUsers } = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as activeUsers 
      FROM activity_logs 
      WHERE created_at >= datetime('now', '-30 days')
    `).get() || { activeUsers: 0 };
    
    // Total content
    const { totalContent } = db.prepare('SELECT COUNT(*) as totalContent FROM content').get();
    
    // Published content
    const { publishedContent } = db.prepare(`
      SELECT COUNT(*) as publishedContent 
      FROM content 
      WHERE status = 'published'
    `).get();
    
    // Total views
    const { totalViews } = db.prepare('SELECT SUM(views) as totalViews FROM content').get();
    
    // Recent content (last 7 days)
    const recentContent = db.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM content
      WHERE created_at >= datetime('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all();

    // Content by status
    const contentByStatus = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM content
      GROUP BY status
    `).all();

    // Content by category
    const contentByCategory = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM content
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
      LIMIT 10
    `).all();

    // Top content by views
    const topContent = db.prepare(`
      SELECT id, title, views, category
      FROM content
      WHERE status = 'published'
      ORDER BY views DESC
      LIMIT 10
    `).all();

    // Recent users
    const { newUsers } = db.prepare(`
      SELECT COUNT(*) as newUsers
      FROM users
      WHERE created_at >= datetime('now', '-30 days')
    `).get();

    res.json({
      summary: {
        totalUsers,
        activeUsers,
        totalContent,
        publishedContent,
        totalViews: totalViews || 0,
        newUsers
      },
      charts: {
        recentContent,
        contentByStatus,
        contentByCategory
      },
      topContent
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get user activity
router.get('/activity', authMiddleware, (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const activities = db.prepare(`
      SELECT 
        al.id,
        al.action,
        al.resource_type,
        al.resource_id,
        al.created_at,
        u.username,
        u.full_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ?
    `).all(parseInt(limit));

    res.json(activities);
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// Log activity
router.post('/activity', authMiddleware, (req, res) => {
  try {
    const { action, resource_type, resource_id } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    db.prepare(`
      INSERT INTO activity_logs (user_id, action, resource_type, resource_id, ip_address)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      action,
      resource_type || null,
      resource_id || null,
      req.ip
    );

    res.status(201).json({ message: 'Activity logged' });
  } catch (error) {
    console.error('Log activity error:', error);
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

module.exports = router;
