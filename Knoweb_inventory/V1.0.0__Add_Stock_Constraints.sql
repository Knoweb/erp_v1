-- ✅ CRITICAL FIX #3: Database constraints to prevent negative stock
-- This migration adds CHECK constraints to prevent negative values from being stored in the database

-- Add CHECK constraints to ensure quantities cannot go negative
ALTER TABLE stocks
ADD CONSTRAINT chk_quantity_non_negative 
    CHECK (quantity >= 0),
ADD CONSTRAINT chk_available_quantity_non_negative 
    CHECK (available_quantity >= 0),
ADD CONSTRAINT chk_reserved_quantity_non_negative 
    CHECK (reserved_quantity >= 0);

-- Add version column if not exists (for optimistic locking)
ALTER TABLE stocks 
ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;

-- Create index for faster lookups during locking
CREATE INDEX IF NOT EXISTS idx_product_warehouse_lock 
ON stocks(product_id, warehouse_id);

-- Log the migration
INSERT INTO flyway_schema_history (version, description, type, installed_by, installed_on, execution_time, success) 
VALUES ('1.0.0', 'Add stock constraints', 'SQL', 'admin', NOW(), 100, TRUE)
ON DUPLICATE KEY UPDATE version='1.0.0';
