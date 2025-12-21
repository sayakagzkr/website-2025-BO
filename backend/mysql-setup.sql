-- MySQL Setup Script for Backoffice System
-- This script creates a secure database user and database

-- Create database
CREATE DATABASE IF NOT EXISTS backoffice_db 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Create dedicated user with limited privileges
CREATE USER IF NOT EXISTS 'backoffice_user'@'localhost' 
  IDENTIFIED BY 'secure_password_change_me';

-- Grant necessary privileges (following principle of least privilege)
GRANT SELECT, INSERT, UPDATE, DELETE ON backoffice_db.* 
  TO 'backoffice_user'@'localhost';

-- Grant CREATE and ALTER for schema updates (can be revoked in production)
GRANT CREATE, ALTER, INDEX, REFERENCES ON backoffice_db.* 
  TO 'backoffice_user'@'localhost';

-- Apply privileges
FLUSH PRIVILEGES;

-- Use the database
USE backoffice_db;

-- Show database information
SELECT 'Database created successfully!' AS status;
SHOW DATABASES LIKE 'backoffice_db';

-- Show user privileges
SHOW GRANTS FOR 'backoffice_user'@'localhost';

-- Security recommendations:
-- 1. Change 'secure_password_change_me' to a strong password
-- 2. Use different passwords for development and production
-- 3. In production, revoke CREATE and ALTER privileges after initial setup
-- 4. Enable MySQL SSL/TLS connections
-- 5. Use firewall rules to restrict database access
-- 6. Enable MySQL audit logging
-- 7. Regular backup schedule
-- 8. Keep MySQL server updated

-- To run this script:
-- mysql -u root -p < backend/mysql-setup.sql
