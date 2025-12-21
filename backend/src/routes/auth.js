const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../utils/database');
const { authMiddleware } = require('../middleware/auth');

// Login with security enhancements
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Get user with MySQL async query
    const user = await db.get(
      'SELECT * FROM users WHERE username = ? AND status = ?',
      [username, 'active']
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(423).json({ 
        error: 'Account is temporarily locked. Please try again later.' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      // Increment failed login attempts
      const attempts = (user.failed_login_attempts || 0) + 1;
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
      
      if (attempts >= maxAttempts) {
        // Lock account
        const lockDuration = parseInt(process.env.ACCOUNT_LOCK_DURATION) || 30;
        const lockUntil = new Date(Date.now() + lockDuration * 60 * 1000);
        
        await db.run(
          'UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?',
          [attempts, lockUntil, user.id]
        );
        
        return res.status(423).json({ 
          error: `Account locked due to too many failed attempts. Try again in ${lockDuration} minutes.` 
        });
      }
      
      await db.run(
        'UPDATE users SET failed_login_attempts = ? WHERE id = ?',
        [attempts, user.id]
      );
      
      return res.status(401).json({ 
        error: 'Invalid credentials',
        attemptsRemaining: maxAttempts - attempts
      });
    }

    // Reset failed attempts and update last login
    await db.run(
      'UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remove sensitive data from response
    delete user.password;
    delete user.failed_login_attempts;
    delete user.locked_until;

    res.json({ 
      token, 
      user,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await db.get(
      'SELECT id, username, email, full_name, role, status, last_login, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
});

// Change password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    
    if (newPassword.length < 8 || !hasUpperCase || !hasLowerCase || !hasNumbers) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters and contain uppercase, lowercase, and numbers' 
      });
    }

    const user = await db.get(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.run(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Logout (optional - for session invalidation)
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // In a more complex system, you might want to blacklist the token
    // For now, we just send a success response
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;
