const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database initialization
const db = require('./utils/database');
db.initDatabase();

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const contentRoutes = require('./routes/content');
const analyticsRoutes = require('./routes/analytics');
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const customersRoutes = require('./routes/customers');
const affiliatesRoutes = require('./routes/affiliates');
const transactionsRoutes = require('./routes/transactions');
const invoicesRoutes = require('./routes/invoices');
const refundsRoutes = require('./routes/refunds');
const logsRoutes = require('./routes/logs');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/affiliates', affiliatesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/refunds', refundsRoutes);
app.use('/api/logs', logsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
