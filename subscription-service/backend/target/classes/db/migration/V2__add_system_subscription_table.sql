-- ============================================================================
-- Migration: Create system_subscription table for granular tracking
-- Purpose: Track individual system subscriptions with dates and metadata
-- Database: subscription_db
-- Version: V2
-- Date: March 10, 2026
-- ============================================================================

-- Create a dedicated table for system subscriptions (normalized approach)
-- This provides better flexibility for per-system billing and tracking
CREATE TABLE IF NOT EXISTS system_subscription (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_tenant_id BIGINT NOT NULL,
    system_name VARCHAR(50) NOT NULL COMMENT 'System identifier: GINUMA, INVENTORY, etc.',
    subscription_start_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subscription_end_date DATETIME NULL COMMENT 'NULL means no expiry or trial',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_trial BOOLEAN NOT NULL DEFAULT FALSE,
    trial_days_remaining INT DEFAULT 0,
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    billing_cycle VARCHAR(20) DEFAULT 'MONTHLY' COMMENT 'MONTHLY, YEARLY, LIFETIME',
    price_per_cycle DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_system_subscription_company
        FOREIGN KEY (company_tenant_id) 
        REFERENCES company_tenant(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    -- Unique constraint: one subscription per system per company
    CONSTRAINT uk_company_system
        UNIQUE KEY (company_tenant_id, system_name),
    
    -- Check constraint for valid system names
    CONSTRAINT chk_system_name
        CHECK (system_name IN ('GINUMA', 'INVENTORY'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores individual system subscriptions per organization';

-- ============================================================================
-- Create indexes for performance
-- ============================================================================

-- Index for finding all systems a company is subscribed to
CREATE INDEX idx_company_tenant_id ON system_subscription(company_tenant_id);

-- Index for finding all subscriptions for a specific system
CREATE INDEX idx_system_name ON system_subscription(system_name);

-- Index for finding active subscriptions
CREATE INDEX idx_is_active ON system_subscription(is_active);

-- Composite index for common query pattern
CREATE INDEX idx_company_system_active 
ON system_subscription(company_tenant_id, system_name, is_active);

-- Index for expiry date queries
CREATE INDEX idx_subscription_end_date ON system_subscription(subscription_end_date);

-- ============================================================================
-- Insert default data for existing companies (if needed)
-- ============================================================================

-- Migrate existing companies with subscribed_systems JSON to normalized table
INSERT INTO system_subscription (company_tenant_id, system_name, is_active, is_trial)
SELECT 
    ct.id,
    systems.system_name,
    TRUE,
    FALSE
FROM company_tenant ct
CROSS JOIN (
    SELECT 'GINUMA' AS system_name
    UNION ALL
    SELECT 'INVENTORY' AS system_name
) systems
WHERE JSON_CONTAINS(ct.subscribed_systems, CONCAT('"', systems.system_name, '"'))
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- Example queries after migration:
-- ============================================================================

-- Get all active systems for a company:
-- SELECT system_name, subscription_end_date, is_trial
-- FROM system_subscription
-- WHERE company_tenant_id = 1 AND is_active = TRUE;

-- Get all companies subscribed to GINUMA:
-- SELECT ct.company_name, ct.org_id, ss.subscription_end_date
-- FROM company_tenant ct
-- JOIN system_subscription ss ON ct.id = ss.company_tenant_id
-- WHERE ss.system_name = 'GINUMA' AND ss.is_active = TRUE;

-- Check if company has access to specific system:
-- SELECT EXISTS(
--     SELECT 1 FROM system_subscription
--     WHERE company_tenant_id = 1 
--     AND system_name = 'GINUMA' 
--     AND is_active = TRUE
--     AND (subscription_end_date IS NULL OR subscription_end_date > NOW())
-- ) AS has_access;

-- Get expiring subscriptions (next 7 days):
-- SELECT ct.company_name, ct.contact_email, ss.system_name, ss.subscription_end_date
-- FROM system_subscription ss
-- JOIN company_tenant ct ON ss.company_tenant_id = ct.id
-- WHERE ss.is_active = TRUE
-- AND ss.subscription_end_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY);
