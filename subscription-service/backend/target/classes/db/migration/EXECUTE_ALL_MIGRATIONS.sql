-- ============================================================================
-- QUICK EXECUTION: Run all migrations in sequence
-- Database: subscription_db
-- Purpose: Complete database setup for Unified SSO Registration Flow
-- ============================================================================

-- Connect to subscription_db
USE subscription_db;

-- Show current tables before migration
SHOW TABLES;

-- ============================================================================
-- MIGRATION V1: Add subscribed_systems JSON column
-- ============================================================================
ALTER TABLE company_tenant
ADD COLUMN IF NOT EXISTS subscribed_systems JSON NOT NULL DEFAULT '[]'
COMMENT 'JSON array of system names the organization has access to (e.g., ["GINUMA", "INVENTORY"])';

-- Update existing records
UPDATE company_tenant 
SET subscribed_systems = JSON_ARRAY()
WHERE subscribed_systems IS NULL OR subscribed_systems = '';

SELECT 'V1 Migration Complete: subscribed_systems column added' AS status;

-- ============================================================================
-- MIGRATION V2: Create system_subscription table
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_subscription (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_tenant_id BIGINT NOT NULL,
    system_name VARCHAR(50) NOT NULL,
    subscription_start_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subscription_end_date DATETIME NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_trial BOOLEAN NOT NULL DEFAULT FALSE,
    trial_days_remaining INT DEFAULT 0,
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    billing_cycle VARCHAR(20) DEFAULT 'MONTHLY',
    price_per_cycle DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_system_subscription_company
        FOREIGN KEY (company_tenant_id) 
        REFERENCES company_tenant(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    CONSTRAINT uk_company_system
        UNIQUE KEY (company_tenant_id, system_name),
    
    CONSTRAINT chk_system_name
        CHECK (system_name IN ('GINUMA', 'INVENTORY'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_company_tenant_id ON system_subscription(company_tenant_id);
CREATE INDEX IF NOT EXISTS idx_system_name ON system_subscription(system_name);
CREATE INDEX IF NOT EXISTS idx_is_active ON system_subscription(is_active);
CREATE INDEX IF NOT EXISTS idx_company_system_active ON system_subscription(company_tenant_id, system_name, is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_end_date ON system_subscription(subscription_end_date);

SELECT 'V2 Migration Complete: system_subscription table created' AS status;

-- ============================================================================
-- MIGRATION V3: Create system_catalog table and view
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_catalog (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    system_code VARCHAR(50) UNIQUE NOT NULL,
    system_name VARCHAR(100) NOT NULL,
    description TEXT,
    frontend_url VARCHAR(255),
    backend_url VARCHAR(255),
    backend_port INT,
    icon_url VARCHAR(255),
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT DEFAULT 0,
    base_price DECIMAL(10, 2) DEFAULT 99.99,
    trial_days INT DEFAULT 14,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert available systems
INSERT INTO system_catalog (
    system_code, system_name, description, frontend_url, backend_url, backend_port, 
    is_enabled, display_order, base_price, trial_days
) VALUES 
('GINUMA', 'Ginuma ERP', 
 'Complete HR, Payroll, Accounting, and CRM solution for modern businesses',
 'http://localhost:5176', 'http://localhost:8081', 8081, TRUE, 1, 149.99, 14),
('INVENTORY', 'Inventory Management', 
 'Advanced inventory, warehouse, order, and supply chain management system',
 'http://localhost:5174', 'http://localhost:8080', 8080, TRUE, 2, 199.99, 14)
ON DUPLICATE KEY UPDATE 
    system_name = VALUES(system_name),
    description = VALUES(description),
    updated_at = CURRENT_TIMESTAMP;

-- Create view
CREATE OR REPLACE VIEW v_company_system_access AS
SELECT 
    ct.id AS company_id,
    ct.org_id,
    ct.company_name,
    ct.contact_email,
    ct.status AS company_status,
    ss.system_name AS system_code,
    sc.system_name AS system_display_name,
    sc.description AS system_description,
    sc.frontend_url,
    sc.backend_url,
    sc.icon_url,
    ss.is_active AS subscription_active,
    ss.is_trial,
    ss.subscription_start_date,
    ss.subscription_end_date,
    ss.billing_cycle,
    ss.price_per_cycle,
    CASE 
        WHEN ss.subscription_end_date IS NULL THEN 'UNLIMITED'
        WHEN ss.subscription_end_date > NOW() THEN 'ACTIVE'
        ELSE 'EXPIRED'
    END AS subscription_status,
    CASE 
        WHEN ss.subscription_end_date IS NOT NULL THEN DATEDIFF(ss.subscription_end_date, NOW())
        ELSE NULL
    END AS days_until_expiry
FROM company_tenant ct
INNER JOIN system_subscription ss ON ct.id = ss.company_tenant_id
INNER JOIN system_catalog sc ON ss.system_name = sc.system_code
WHERE ss.is_active = TRUE AND ct.status = 'ACTIVE';

SELECT 'V3 Migration Complete: system_catalog table and view created' AS status;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show updated schema
SHOW TABLES;

-- Verify column added
DESCRIBE company_tenant;

-- Check new tables
SELECT 'system_subscription table' AS checking;
DESCRIBE system_subscription;

SELECT 'system_catalog table' AS checking;
DESCRIBE system_catalog;

-- Verify catalog data
SELECT * FROM system_catalog;

-- Verify view
SHOW CREATE VIEW v_company_system_access;

-- Show counts
SELECT COUNT(*) AS company_tenant_count FROM company_tenant;
SELECT COUNT(*) AS system_catalog_count FROM system_catalog;
SELECT COUNT(*) AS system_subscription_count FROM system_subscription;

SELECT '✓ All migrations completed successfully!' AS status;
