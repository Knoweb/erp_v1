-- MySQL Database Initialization Script
-- This script creates all databases required by the microservices

-- Create database for Identity Service
CREATE DATABASE IF NOT EXISTS identity_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create database for Subscription Service (also used by Identity Service)
CREATE DATABASE IF NOT EXISTS subscription_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create database for Ginuma Service
CREATE DATABASE IF NOT EXISTS ginum_apps CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create database for Product Service
CREATE DATABASE IF NOT EXISTS product_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create database for Inventory Service
CREATE DATABASE IF NOT EXISTS inventory_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create database for Order Service
CREATE DATABASE IF NOT EXISTS order_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create database for Warehouse Service
CREATE DATABASE IF NOT EXISTS warehouse_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create database for Supplier Service
CREATE DATABASE IF NOT EXISTS supplier_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create database for User Service
CREATE DATABASE IF NOT EXISTS user_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create database for Notification Service
CREATE DATABASE IF NOT EXISTS notification_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create database for Catalog Service
CREATE DATABASE IF NOT EXISTS catalog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create database for Reporting Service
CREATE DATABASE IF NOT EXISTS reporting_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges to root user (optional - already has privileges)
-- GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY '1234';
-- FLUSH PRIVILEGES;

-- Display created databases
SHOW DATABASES;
