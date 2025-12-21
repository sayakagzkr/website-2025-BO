# MySQL Migration Quick Start Guide

This document provides a quick setup guide for the MySQL-based backoffice system.

## Prerequisites

Before starting, ensure you have:
- ✅ MySQL 8.0+ installed
- ✅ Node.js 18+ installed
- ✅ Root access to MySQL

## Quick Setup (5 minutes)

### Step 1: Create MySQL Database

```bash
# Login to MySQL as root
mysql -u root -p

# Run these commands:
CREATE DATABASE backoffice_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'backoffice_user'@'localhost' IDENTIFIED BY 'YourSecurePassword123!';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES ON backoffice_db.* TO 'backoffice_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Or use the provided script:
```bash
mysql -u root -p < backend/mysql-setup.sql
# Remember to change the password in the script first!
```

### Step 2: Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` file:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=backoffice_user
DB_PASSWORD=YourSecurePassword123!
DB_NAME=backoffice_db

JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
```

Generate a secure JWT secret:
```bash
openssl rand -base64 32
```

### Step 3: Install Dependencies

```bash
# From project root
npm run install:all
```

### Step 4: Start the Application

```bash
npm run dev
```

The application will:
1. Connect to MySQL
2. Create all necessary tables automatically
3. Create default admin user (admin / admin123)
4. Start backend on http://localhost:3001
5. Start frontend on http://localhost:5173

## Verify Setup

### Test Database Connection

```bash
# Test connection
mysql -u backoffice_user -p backoffice_db

# Check tables
SHOW TABLES;

# Check admin user
SELECT username, email, role FROM users WHERE role='admin';
```

### Test API

```bash
# Health check
curl http://localhost:3001/api/health

# Should return:
# {"status":"ok","timestamp":"...","environment":"development","database":"MySQL"}
```

### Login to Application

1. Open browser: http://localhost:5173
2. Login with:
   - Username: `admin`
   - Password: `admin123`
3. ⚠️ **IMPORTANT**: Change password immediately!

## Security Checklist

Before going to production:

- [ ] Change default admin password
- [ ] Change JWT_SECRET to a strong random string
- [ ] Change all database passwords
- [ ] Enable MySQL SSL/TLS (set DB_SSL=true)
- [ ] Configure firewall rules
- [ ] Set up automated backups
- [ ] Review user privileges
- [ ] Set NODE_ENV=production
- [ ] Configure HTTPS
- [ ] Review CORS settings

## Common Issues

### "Access Denied" Error
- Check username/password in `.env`
- Verify user exists: `SELECT User, Host FROM mysql.user;`

### "Unknown Database" Error
- Ensure database was created
- Check database name in `.env` matches created database

### "Connection Refused" Error
- Check if MySQL is running: `systemctl status mysql`
- Check if MySQL is listening on port 3306: `netstat -an | grep 3306`

### Tables Not Created
- Check application logs for errors
- Verify user has CREATE privilege
- Try connecting manually to test

## Next Steps

1. **Read Full Documentation**: [MYSQL_SETUP.md](MYSQL_SETUP.md)
2. **Security Hardening**: Review security best practices
3. **Backup Setup**: Configure automated backups
4. **Monitoring**: Set up database monitoring
5. **Production Deployment**: Follow production checklist

## Support

For detailed setup instructions and troubleshooting:
- [MYSQL_SETUP.md](MYSQL_SETUP.md) - Complete MySQL guide
- [README.md](README.md) - Application documentation
- GitHub Issues - Report problems

---

## Cloud Database Setup

### AWS RDS (Recommended for Production)

```env
DB_HOST=your-instance.region.rds.amazonaws.com
DB_PORT=3306
DB_USER=backoffice_user
DB_PASSWORD=strong_password_here
DB_NAME=backoffice_db
DB_SSL=true
```

### Google Cloud SQL

```env
DB_HOST=/cloudsql/project:region:instance
DB_PORT=3306
DB_USER=backoffice_user
DB_PASSWORD=strong_password_here
DB_NAME=backoffice_db
```

### Azure MySQL

```env
DB_HOST=your-server.mysql.database.azure.com
DB_PORT=3306
DB_USER=backoffice_user@your-server
DB_PASSWORD=strong_password_here
DB_NAME=backoffice_db
DB_SSL=true
```

---

**Ready to start!** 🚀

Run `npm run dev` and access http://localhost:5173
