-- ============================================================================
-- Migration: Add subscribed_systems column to company_tenant table
-- Purpose: Track which systems (GINUMA, INVENTORY) an organization has access to
-- Database: subscription_db
-- Version: V1
-- Date: March 10, 2026
-- ============================================================================

-- Add JSON column to store array of subscribed systems
-- MySQL 5.7+ supports JSON data type
ALTER TABLE company_tenant
ADD COLUMN subscribed_systems JSON NOT NULL DEFAULT '[]'
COMMENT 'JSON array of system names the organization has access to (e.g., ["GINUMA", "INVENTORY"])';

-- Add index for better query performance when filtering by system
ALTER TABLE company_tenant
ADD INDEX idx_subscribed_systems ((CAST(subscribed_systems AS CHAR(1000) ARRAY)));

-- ============================================================================
-- Update existing records to have empty array (if table already has data)
-- ============================================================================
UPDATE company_tenant 
SET subscribed_systems = JSON_ARRAY()
WHERE subscribed_systems IS NULL OR subscribed_systems = '';

-- ============================================================================
-- Example usage after migration:
-- ============================================================================
-- Insert new company with GINUMA system:
-- INSERT INTO company_tenant (org_id, company_name, contact_email, subscribed_systems, status)
-- VALUES (100, 'Test Corp', 'admin@testcorp.com', JSON_ARRAY('GINUMA'), 'ACTIVE');

-- Insert company with multiple systems:
-- INSERT INTO company_tenant (org_id, company_name, contact_email, subscribed_systems, status)
-- VALUES (101, 'Multi Corp', 'admin@multicorp.com', JSON_ARRAY('GINUMA', 'INVENTORY'), 'ACTIVE');

-- Query companies subscribed to GINUMA:
-- SELECT * FROM company_tenant WHERE JSON_CONTAINS(subscribed_systems, '"GINUMA"');

-- Query companies subscribed to INVENTORY:
-- SELECT * FROM company_tenant WHERE JSON_CONTAINS(subscribed_systems, '"INVENTORY"');

-- Add a system to existing company:
-- UPDATE company_tenant 
-- SET subscribed_systems = JSON_ARRAY_APPEND(subscribed_systems, '$', 'INVENTORY')
-- WHERE org_id = 100;

-- Remove a system from company:
-- UPDATE company_tenant 
-- SET subscribed_systems = JSON_REMOVE(
--     subscribed_systems, 
--     JSON_UNQUOTE(JSON_SEARCH(subscribed_systems, 'one', 'GINUMA'))
-- )
-- WHERE org_id = 100;
