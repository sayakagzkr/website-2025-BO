# MySQL Database Setup Guide

This guide will help you set up a secure MySQL database for the Backoffice Management System.

## Prerequisites

- MySQL 8.0 or higher installed
- Root access to MySQL server
- Basic knowledge of MySQL administration

## Quick Setup

### 1. Create Database and User

Run the provided SQL script:

```bash
mysql -u root -p < backend/mysql-setup.sql
```

Or execute manually:

```sql
-- Create database
CREATE DATABASE backoffice_db 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'backoffice_user'@'localhost' 
  IDENTIFIED BY 'YOUR_SECURE_PASSWORD_HERE';

-- Grant privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON backoffice_db.* 
  TO 'backoffice_user'@'localhost';
GRANT CREATE, ALTER, INDEX, REFERENCES ON backoffice_db.* 
  TO 'backoffice_user'@'localhost';

FLUSH PRIVILEGES;
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the database credentials:

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=backoffice_user
DB_PASSWORD=YOUR_SECURE_PASSWORD_HERE
DB_NAME=backoffice_db
DB_SSL=false  # Set to true in production with SSL certificates
```

### 3. Initialize Database Tables

The application will automatically create all necessary tables on first run:

```bash
npm run dev
```

## Security Best Practices

### 1. Strong Passwords

- Use passwords with at least 16 characters
- Include uppercase, lowercase, numbers, and special characters
- Never use default passwords in production
- Use different passwords for each environment

Generate a secure password:
```bash
openssl rand -base64 32
```

### 2. User Privileges

Follow the principle of least privilege:

```sql
-- For production, revoke CREATE and ALTER after initial setup
REVOKE CREATE, ALTER ON backoffice_db.* 
  FROM 'backoffice_user'@'localhost';
```

### 3. Enable SSL/TLS

For production environments, always use SSL:

```sql
-- Require SSL for user
ALTER USER 'backoffice_user'@'localhost' 
  REQUIRE SSL;
```

Update `.env`:
```env
DB_SSL=true
```

### 4. Firewall Configuration

Restrict MySQL access to specific IPs:

```sql
-- Create user for specific IP
CREATE USER 'backoffice_user'@'192.168.1.100' 
  IDENTIFIED BY 'secure_password';

-- Or for application server IP range
CREATE USER 'backoffice_user'@'192.168.1.%' 
  IDENTIFIED BY 'secure_password';
```

### 5. MySQL Server Security

Edit MySQL configuration (`/etc/mysql/my.cnf`):

```ini
[mysqld]
# Bind to specific interface
bind-address = 127.0.0.1

# Disable remote root login
skip-networking = 0

# Enable SSL
ssl-ca=/path/to/ca.pem
ssl-cert=/path/to/server-cert.pem
ssl-key=/path/to/server-key.pem

# Security settings
local-infile=0
symbolic-links=0

# Performance and security
max_connections=100
max_connect_errors=10
max_allowed_packet=16M

# Logging
log_error=/var/log/mysql/error.log
slow_query_log=1
slow_query_log_file=/var/log/mysql/slow.log
long_query_time=2
```

### 6. Regular Backups

Set up automated backups:

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backup/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u backoffice_user -p backoffice_db | gzip > "${BACKUP_DIR}/backup_${DATE}.sql.gz"

# Keep only last 30 days
find ${BACKUP_DIR} -name "backup_*.sql.gz" -mtime +30 -delete
```

### 7. Audit Logging

Enable MySQL audit plugin:

```sql
INSTALL PLUGIN audit_log SONAME 'audit_log.so';
SET GLOBAL audit_log_policy=ALL;
SET GLOBAL audit_log_format=JSON;
```

### 8. Password Policies

Enforce strong password policies:

```sql
-- Set password policy
SET GLOBAL validate_password.policy=STRONG;
SET GLOBAL validate_password.length=12;
SET GLOBAL validate_password.mixed_case_count=1;
SET GLOBAL validate_password.number_count=1;
SET GLOBAL validate_password.special_char_count=1;
```

## Cloud Database Options

### AWS RDS MySQL

1. Create RDS MySQL instance
2. Configure security groups
3. Enable automated backups
4. Enable SSL connections
5. Use IAM database authentication

Update `.env`:
```env
DB_HOST=your-instance.region.rds.amazonaws.com
DB_PORT=3306
DB_USER=backoffice_user
DB_PASSWORD=secure_password
DB_NAME=backoffice_db
DB_SSL=true
```

### Google Cloud SQL

1. Create Cloud SQL MySQL instance
2. Configure SSL certificates
3. Set up private IP
4. Enable automated backups

```env
DB_HOST=/cloudsql/project:region:instance
DB_PORT=3306
DB_USER=backoffice_user
DB_PASSWORD=secure_password
DB_NAME=backoffice_db
```

### Azure Database for MySQL

1. Create Azure MySQL server
2. Configure firewall rules
3. Enable SSL enforcement
4. Set up automatic backups

```env
DB_HOST=your-server.mysql.database.azure.com
DB_PORT=3306
DB_USER=backoffice_user@your-server
DB_PASSWORD=secure_password
DB_NAME=backoffice_db
DB_SSL=true
```

## Monitoring and Maintenance

### Check Database Status

```sql
-- Check connections
SHOW PROCESSLIST;

-- Check database size
SELECT 
  table_schema AS 'Database',
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'backoffice_db'
GROUP BY table_schema;

-- Check table sizes
SELECT 
  table_name AS 'Table',
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'backoffice_db'
ORDER BY (data_length + index_length) DESC;
```

### Optimize Tables

```sql
-- Optimize all tables
OPTIMIZE TABLE users, content, transactions, products, 
               customers, affiliates, invoices;
```

### Performance Tuning

```sql
-- Add indexes for common queries
CREATE INDEX idx_transaction_date ON transactions(created_at);
CREATE INDEX idx_customer_email ON customers(email);
CREATE INDEX idx_product_category ON products(category_id, status);
```

## Troubleshooting

### Connection Issues

1. Check MySQL is running:
   ```bash
   systemctl status mysql
   ```

2. Test connection:
   ```bash
   mysql -u backoffice_user -p -h localhost backoffice_db
   ```

3. Check firewall:
   ```bash
   sudo ufw status
   sudo ufw allow 3306/tcp  # If needed
   ```

### Permission Issues

```sql
-- Show user privileges
SHOW GRANTS FOR 'backoffice_user'@'localhost';

-- Re-grant if needed
GRANT ALL PRIVILEGES ON backoffice_db.* 
  TO 'backoffice_user'@'localhost';
FLUSH PRIVILEGES;
```

### Performance Issues

1. Check slow queries:
   ```bash
   tail -f /var/log/mysql/slow.log
   ```

2. Analyze query performance:
   ```sql
   EXPLAIN SELECT * FROM transactions WHERE status = 'pending';
   ```

## Migration from SQLite

If migrating from SQLite:

1. Export SQLite data:
   ```bash
   sqlite3 backend/data/database.db .dump > sqlite_dump.sql
   ```

2. Convert to MySQL format (adjust as needed)
3. Import to MySQL:
   ```bash
   mysql -u backoffice_user -p backoffice_db < mysql_import.sql
   ```

## Support

For issues or questions:
- Check MySQL error log: `/var/log/mysql/error.log`
- Review application logs
- Consult MySQL documentation: https://dev.mysql.com/doc/

---

**Security Warning**: Always keep your database credentials secure. Never commit `.env` files to version control. Use environment-specific configurations for different deployment environments.
