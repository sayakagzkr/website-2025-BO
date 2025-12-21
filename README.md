# Backoffice Management System

Modern backoffice management system - React + TypeScript + Node.js + Express

## Overview

This project is a management system designed to streamline backoffice operations for businesses and organizations. It provides features such as user management, content management, and analytics dashboard.

## Key Features

### 🔐 Authentication & Authorization
- JWT authentication
- Role-based access control (admin/user)
- Secure password management

### 📊 Dashboard
- Real-time statistics
- Data visualization with graphs and charts
- Popular content tracking
- Activity logs

### 👥 User Management
- Create, edit, and delete users
- Role and status management
- Detailed search and filtering

### 📝 Content Management
- Create and edit articles/pages
- Status management (draft/published/archived)
- Category classification
- View count tracking

### 🛒 E-commerce Features
- Transaction management
- Product catalog
- Customer database
- Affiliate partner management
- Invoice generation
- Refund processing
- Download and mail logs

### ⚙️ Settings
- Password change
- Account information management

## Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS
- **React Router** - Routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MySQL 2** - Database (with connection pooling)
- **JWT (jsonwebtoken)** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Validation

## Security Features

### Database Security
- **MySQL with SSL/TLS support** - Encrypted database connections
- **Connection pooling** - Efficient resource management
- **Prepared statements** - SQL injection prevention
- **User privilege separation** - Limited database permissions
- **Password policies** - Strong password requirements

### Application Security
- **Account lockout** - Protection against brute force attacks
- **JWT token authentication** - Secure session management
- **Password strength validation** - Enforced password complexity
- **CORS configuration** - Restricted cross-origin requests
- **Security headers** - XSS, clickjacking protection
- **Rate limiting** - API abuse prevention
- **Input validation** - Data sanitization

## Setup

### Requirements
- Node.js 18 or higher
- MySQL 8.0 or higher
- npm or yarn

### Database Setup

1. **Install MySQL** (if not already installed)

2. **Create database and user**
```bash
# Using the provided script
mysql -u root -p < backend/mysql-setup.sql

# Or manually create
mysql -u root -p
```

```sql
CREATE DATABASE backoffice_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'backoffice_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES 
  ON backoffice_db.* TO 'backoffice_user'@'localhost';
FLUSH PRIVILEGES;
```

3. **Configure environment variables**
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
```

Required `.env` configuration:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=backoffice_user
DB_PASSWORD=your_secure_password
DB_NAME=backoffice_db
DB_SSL=false  # Set to true in production

JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

For detailed MySQL setup instructions, see [MYSQL_SETUP.md](MYSQL_SETUP.md)

### Application Installation

1. Clone the repository (or download)

2. Install dependencies
```bash
npm run install:all
```

This will install all dependencies for root, backend, and frontend.

3. The application will automatically create database tables on first run

### Start Development Servers

```bash
npm run dev
```

This will start the following servers:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

Or start them individually:

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

## Default Credentials

An admin account is automatically created on first startup:

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **CRITICAL SECURITY**: 
- Change the password immediately after first login
- The new password must be at least 8 characters
- Must contain uppercase, lowercase, and numbers
- Account will lock after 5 failed login attempts (configurable)

## Project Structure

```
backoffice-system/
├── backend/              # Backend application
│   ├── src/
│   │   ├── controllers/  # Controllers
│   │   ├── models/       # Data models
│   │   ├── routes/       # API routes
│   │   │   ├── auth.js   # Authentication API
│   │   │   ├── users.js  # User management API
│   │   │   ├── content.js # Content management API
│   │   │   ├── transactions.js # Transaction API
│   │   │   ├── products.js # Product API
│   │   │   └── analytics.js # Analytics API
│   │   ├── middleware/   # Middleware
│   │   │   └── auth.js   # Authentication middleware
│   │   ├── utils/        # Utilities
│   │   │   └── database.js # Database configuration
│   │   └── server.js     # Entry point
│   ├── data/             # SQLite database files
│   ├── .env              # Environment variables
│   └── package.json
│
├── frontend/             # Frontend application
│   ├── src/
│   │   ├── components/   # Shared components
│   │   │   └── Layout.tsx # Layout component
│   │   ├── pages/        # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Users.tsx
│   │   │   ├── Content.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── Transactions.tsx
│   │   │   └── Settings.tsx
│   │   ├── services/     # API communication
│   │   │   └── api.ts
│   │   ├── hooks/        # Custom hooks
│   │   │   └── useAuth.tsx
│   │   ├── types/        # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── App.tsx       # Application root
│   │   ├── main.tsx      # Entry point
│   │   └── index.css     # Global styles
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── package.json          # Root package
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/change-password` - Change password

### User Management
- `GET /api/users` - Get user list
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Content Management
- `GET /api/content` - Get content list
- `GET /api/content/:id` - Get content details
- `POST /api/content` - Create content
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content

### Products
- `GET /api/products` - Get product list
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Transactions
- `GET /api/transactions` - Get transaction list with filters
- `GET /api/transactions/:id` - Get transaction details
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/activity` - Activity logs
- `POST /api/analytics/activity` - Record activity

## Database

Uses **MySQL 8.0+** with secure connection pooling and prepared statements.

### Database Engine
- **InnoDB** - ACID compliant transactions
- **UTF8MB4** - Full Unicode support
- **Connection pooling** - 10 concurrent connections
- **Prepared statements** - SQL injection protection

### Table Structure

All tables use InnoDB engine with proper foreign keys and indexes.

**users**
- id, username, email, password, full_name, role, status
- last_login, failed_login_attempts, locked_until
- created_at, updated_at
- Indexes: username, email, status

**content**
- id, title, slug, content, status, category
- author_id (FK), views, created_at, updated_at, published_at
- Indexes: slug, status, author_id
- Full-text search on title and content

**products**
- id, name, slug, description, price, stock
- category_id (FK), status, image_url, created_at, updated_at
- Indexes: slug, category_id, status
- Full-text search on name and description

**transactions**
- id, transaction_id, customer_id (FK), affiliate_id (FK)
- product_id (FK), amount, commission, status
- payment_method, card_bin, country, ip_address, created_at
- Indexes: transaction_id, customer, affiliate, status, created_at

**customers**
- id, email, full_name, country, address, phone
- status, created_at, updated_at
- Indexes: email, country, status

**affiliates**
- id, user_id (FK), code, commission_rate
- total_sales, total_commission, status
- created_at, updated_at
- Indexes: code, status

**invoices**
- id, invoice_number, transaction_id (FK), customer_id (FK)
- amount, status, due_date, paid_at, created_at
- Indexes: invoice_number, status, due_date

**refunds**
- id, transaction_id (FK), amount, reason, status
- processed_at, processed_by (FK), created_at
- Indexes: status, transaction_id

**download_logs**
- id, customer_id (FK), product_id (FK), transaction_id (FK)
- ip_address, user_agent, created_at
- Indexes: customer, product, created_at

**mail_logs**
- id, recipient, subject, body, status, error_message, sent_at
- Indexes: recipient, status, sent_at

**activity_logs**
- id, user_id (FK), action, resource_type, resource_id
- ip_address, user_agent, created_at
- Indexes: user_id, action, created_at

### Database Backup

Regular backups are essential:

```bash
# Full backup
mysqldump -u backoffice_user -p backoffice_db | gzip > backup_$(date +%Y%m%d).sql.gz

# Backup specific tables
mysqldump -u backoffice_user -p backoffice_db users transactions | gzip > critical_backup.sql.gz
```

For automated backup setup, see [MYSQL_SETUP.md](MYSQL_SETUP.md#regular-backups)

## Environment Variables

Configure the following environment variables in `backend/.env`:

```env
# Server
PORT=3001
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=backoffice_user
DB_PASSWORD=your_secure_password_here
DB_NAME=backoffice_db
DB_SSL=false  # Set to true in production

# Security
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_DURATION=30

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

⚠️ **Security**:
- Always use strong, unique passwords
- Change all default secrets in production
- Use different credentials for each environment
- Enable SSL for database connections in production
- Generate secure random strings:
  ```bash
  openssl rand -base64 32
  ```

## Security

### Authentication & Authorization
- **bcrypt password hashing** - 12 salt rounds
- **JWT token authentication** - Configurable expiration
- **Role-based access control** - Admin/User roles
- **Account lockout mechanism** - Brute force protection
- **Password strength validation** - Enforced complexity requirements

### Database Security
- **MySQL prepared statements** - SQL injection prevention
- **Connection pooling** - Resource management
- **SSL/TLS support** - Encrypted connections
- **User privilege separation** - Least privilege principle
- **Foreign key constraints** - Referential integrity

### Application Security
- **CORS configuration** - Restricted origins
- **Security headers** - XSS, clickjacking protection
- **Rate limiting** - API abuse prevention (100 req/15min)
- **Input validation** - express-validator sanitization
- **Error handling** - No sensitive data exposure
- **Audit logging** - Activity tracking

### Production Checklist

Before deploying to production:

1. **Change all default passwords and secrets**
2. **Enable MySQL SSL/TLS**
3. **Set up firewall rules**
4. **Configure automated backups**
5. **Enable rate limiting**
6. **Set NODE_ENV=production**
7. **Review database user privileges**
8. **Set up monitoring and alerts**
9. **Configure HTTPS/SSL certificates**
10. **Review CORS settings**

See [MYSQL_SETUP.md](MYSQL_SETUP.md) for detailed security configuration.

## Customization

### Change Color Theme

You can change the primary color in `frontend/tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Customize color codes
      }
    }
  }
}
```

### Add New Features

1. Backend: Add new route files in `backend/src/routes/`
2. Frontend: Add new pages in `frontend/src/pages/`
3. API Service: Add API functions in `frontend/src/services/api.ts`

## Troubleshooting

### Port Already in Use

If another application is using port 3001 or 5173:

- Backend: Change `PORT` in `backend/.env`
- Frontend: Change `server.port` in `frontend/vite.config.ts`

### Database Errors

**Check MySQL is running:**
```bash
# Linux/Mac
systemctl status mysql
# or
sudo service mysql status

# Check if MySQL is listening
netstat -an | grep 3306
```

**Test database connection:**
```bash
mysql -u backoffice_user -p -h localhost backoffice_db
```

**Common issues:**

1. **Access denied**: Check username/password in `.env`
2. **Connection refused**: Ensure MySQL is running
3. **Unknown database**: Run database setup script
4. **Too many connections**: Increase `max_connections` in MySQL

**Reset database:**
```bash
# Backup first!
mysqldump -u backoffice_user -p backoffice_db > backup.sql

# Drop and recreate
mysql -u root -p
DROP DATABASE backoffice_db;
CREATE DATABASE backoffice_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Restart application to recreate tables
```

For more troubleshooting, see [MYSQL_SETUP.md](MYSQL_SETUP.md#troubleshooting)

## License

MIT License

## Support

If you encounter any issues, please report them in the GitHub Issues section.

---

**Developer Note**: This system was created for development and learning purposes. If you plan to use it in production, conduct a security audit and implement appropriate security measures.
