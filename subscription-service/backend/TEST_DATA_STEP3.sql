-- =============================================================================
-- STEP 3: TEST DATA SETUP
-- Insert sample companies with different subscription configurations
-- =============================================================================

USE subscription_db;

-- Clear existing test data (optional)
-- DELETE FROM company_tenant WHERE org_id >= 100 AND org_id <= 500;

-- =============================================================================
-- 1. GINUMA-ONLY COMPANY
-- =============================================================================
INSERT INTO company_tenant (org_id, company_name, contact_email, status, subscribed_systems, created_at)
VALUES (
    100,
    'Test Ginuma Corp',
    'test@ginuma.com',
    'ACTIVE',
    '["GINUMA"]',
    NOW()
);

-- =============================================================================
-- 2. INVENTORY-ONLY COMPANY
-- =============================================================================
INSERT INTO company_tenant (org_id, company_name, contact_email, status, subscribed_systems, created_at)
VALUES (
    200,
    'Test Inventory Corp',
    'test@inventory.com',
    'ACTIVE',
    '["INVENTORY"]',
    NOW()
);

-- =============================================================================
-- 3. MULTI-SYSTEM COMPANY (Both GINUMA and INVENTORY)
-- =============================================================================
INSERT INTO company_tenant (org_id, company_name, contact_email, status, subscribed_systems, created_at)
VALUES (
    300,
    'Test Multi Corp',
    'test@multi.com',
    'ACTIVE',
    '["GINUMA", "INVENTORY"]',
    NOW()
);

-- =============================================================================
-- 4. BLOCKED COMPANY
-- =============================================================================
INSERT INTO company_tenant (org_id, company_name, contact_email, status, subscribed_systems, created_at)
VALUES (
    400,
    'Blocked Corp',
    'blocked@test.com',
    'BLOCKED',
    '["GINUMA"]',
    NOW()
);

-- =============================================================================
-- 5. PENDING COMPANY (Not yet approved)
-- =============================================================================
INSERT INTO company_tenant (org_id, company_name, contact_email, status, subscribed_systems, created_at)
VALUES (
    500,
    'Pending Corp',
    'pending@test.com',
    'PENDING',
    '["INVENTORY"]',
    NOW()
);

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- View all test companies
SELECT 
    org_id,
    company_name,
    contact_email,
    status,
    subscribed_systems,
    JSON_LENGTH(subscribed_systems) AS system_count,
    created_at
FROM company_tenant
WHERE org_id >= 100 AND org_id <= 500
ORDER BY org_id;

-- Count by status
SELECT 
    status,
    COUNT(*) AS count
FROM company_tenant
WHERE org_id >= 100 AND org_id <= 500
GROUP BY status;

-- Companies with GINUMA
SELECT 
    org_id,
    company_name,
    subscribed_systems
FROM company_tenant
WHERE JSON_CONTAINS(subscribed_systems, '"GINUMA"')
  AND org_id >= 100 AND org_id <= 500;

-- Companies with INVENTORY
SELECT 
    org_id,
    company_name,
    subscribed_systems
FROM company_tenant
WHERE JSON_CONTAINS(subscribed_systems, '"INVENTORY"')
  AND org_id >= 100 AND org_id <= 500;

-- Companies with both systems
SELECT 
    org_id,
    company_name,
    subscribed_systems
FROM company_tenant
WHERE JSON_CONTAINS(subscribed_systems, '"GINUMA"')
  AND JSON_CONTAINS(subscribed_systems, '"INVENTORY"')
  AND org_id >= 100 AND org_id <= 500;

-- =============================================================================
-- EXPECTED RESULTS
-- =============================================================================
-- After running this script, you should have:
-- - 5 test companies (org_id 100-500)
-- - 1 GINUMA-only company (org 100)
-- - 1 INVENTORY-only company (org 200)
-- - 1 Multi-system company (org 300)
-- - 1 Blocked company (org 400)
-- - 1 Pending company (org 500)
-- =============================================================================
