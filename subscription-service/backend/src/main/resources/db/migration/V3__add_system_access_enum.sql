-- ============================================================================
-- Migration: Add system access configuration and enum values
-- Purpose: Define available systems and their metadata
-- Database: subscription_db
-- Version: V3
-- Date: March 10, 2026
-- ============================================================================

-- Create a system_catalog table to define available systems
CREATE TABLE IF NOT EXISTS system_catalog (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    system_code VARCHAR(50) UNIQUE NOT NULL COMMENT 'Unique identifier: GINUMA, INVENTORY',
    system_name VARCHAR(100) NOT NULL COMMENT 'Display name: Ginuma ERP, Inventory Management',
    description TEXT COMMENT 'System description for marketing',
    frontend_url VARCHAR(255) COMMENT 'Frontend URL: http://localhost:5176',
    backend_url VARCHAR(255) COMMENT 'Backend API URL: http://localhost:8081',
    backend_port INT COMMENT 'Backend port number',
    icon_url VARCHAR(255) COMMENT 'System icon/logo URL',
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'If false, system is hidden from registration',
    display_order INT DEFAULT 0 COMMENT 'Order for displaying on dashboard',
    base_price DECIMAL(10, 2) DEFAULT 99.99 COMMENT 'Base monthly price',
    trial_days INT DEFAULT 14 COMMENT 'Free trial period in days',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catalog of available systems in the ERP platform';

-- ============================================================================
-- Insert available systems
-- ============================================================================

INSERT INTO system_catalog (
    system_code, 
    system_name, 
    description, 
    frontend_url, 
    backend_url, 
    backend_port, 
    is_enabled, 
    display_order,
    base_price,
    trial_days
) VALUES 
(
    'GINUMA',
    'Ginuma ERP',
    'Complete HR, Payroll, Accounting, and CRM solution for modern businesses',
    'http://localhost:5176',
    'http://localhost:8081',
    8081,
    TRUE,
    1,
    149.99,
    14
),
(
    'INVENTORY',
    'Inventory Management',
    'Advanced inventory, warehouse, order, and supply chain management system',
    'http://localhost:5174',
    'http://localhost:8080',
    8080,
    TRUE,
    2,
    199.99,
    14
)
ON DUPLICATE KEY UPDATE 
    system_name = VALUES(system_name),
    description = VALUES(description),
    frontend_url = VALUES(frontend_url),
    backend_url = VALUES(backend_url),
    backend_port = VALUES(backend_port),
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- Add foreign key to system_subscription table
-- ============================================================================

-- First, ensure all existing system_name values are valid
UPDATE system_subscription 
SET system_name = UPPER(system_name)
WHERE system_name IN ('ginuma', 'inventory');

-- Drop the old check constraint
ALTER TABLE system_subscription 
DROP CONSTRAINT IF EXISTS chk_system_name;

-- Add new check constraint based on catalog
ALTER TABLE system_subscription
ADD CONSTRAINT chk_system_name_valid
CHECK (system_name IN (
    SELECT system_code FROM system_catalog WHERE is_enabled = TRUE
));

-- ============================================================================
-- Create view for easy access to company systems
-- ============================================================================

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
        WHEN ss.subscription_end_date IS NOT NULL THEN
            DATEDIFF(ss.subscription_end_date, NOW())
        ELSE NULL
    END AS days_until_expiry
FROM company_tenant ct
INNER JOIN system_subscription ss ON ct.id = ss.company_tenant_id
INNER JOIN system_catalog sc ON ss.system_name = sc.system_code
WHERE ss.is_active = TRUE
  AND ct.status = 'ACTIVE';

-- ============================================================================
-- Example queries using the view:
-- ============================================================================

-- Get all systems accessible by a company:
-- SELECT * FROM v_company_system_access WHERE org_id = 53;

-- Get companies with expiring subscriptions:
-- SELECT company_name, system_display_name, days_until_expiry
-- FROM v_company_system_access
-- WHERE subscription_status = 'ACTIVE'
-- AND days_until_expiry <= 7
-- ORDER BY days_until_expiry;

-- Get active systems count per company:
-- SELECT org_id, company_name, COUNT(*) AS active_systems
-- FROM v_company_system_access
-- GROUP BY org_id, company_name;
