-- =====================================================
-- Migration: Create coupons table
-- Created: 2025-11-21T14:23:20Z
-- Tables: coupons
-- Purpose: Store discount coupons with codes, rates, and usage limits
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function for updated_at (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABLE: coupons
-- Purpose: Store discount coupons for billing
-- =====================================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Coupon identification
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Discount configuration
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Usage limits
  max_uses INTEGER,
  max_uses_per_user INTEGER DEFAULT 1,
  usage_count INTEGER DEFAULT 0 NOT NULL,
  
  -- Validity
  valid_from TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  valid_until TIMESTAMPTZ,
  
  -- Restrictions
  applicable_plans UUID[] DEFAULT ARRAY[]::UUID[],
  minimum_amount DECIMAL(10, 2),
  
  -- Status
  is_active BOOLEAN DEFAULT true NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT coupons_code_not_empty CHECK (length(trim(code)) > 0),
  CONSTRAINT coupons_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT coupons_discount_value_positive CHECK (discount_value > 0),
  CONSTRAINT coupons_max_uses_positive CHECK (max_uses IS NULL OR max_uses > 0),
  CONSTRAINT coupons_max_uses_per_user_positive CHECK (max_uses_per_user > 0),
  CONSTRAINT coupons_usage_count_non_negative CHECK (usage_count >= 0),
  CONSTRAINT coupons_valid_until_after_valid_from CHECK (valid_until IS NULL OR valid_until > valid_from),
  CONSTRAINT coupons_percentage_discount_valid CHECK (
    discount_type != 'percentage' OR (discount_value > 0 AND discount_value <= 100)
  )
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS coupons_code_idx ON coupons(code) WHERE status != 'deleted';
CREATE INDEX IF NOT EXISTS coupons_status_idx ON coupons(status) WHERE status != 'deleted';
CREATE INDEX IF NOT EXISTS coupons_is_active_idx ON coupons(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS coupons_valid_from_idx ON coupons(valid_from);
CREATE INDEX IF NOT EXISTS coupons_valid_until_idx ON coupons(valid_until) WHERE valid_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS coupons_created_at_idx ON coupons(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Coupons are publicly readable for validation, but only admins can modify
CREATE POLICY "coupons_select_all"
  ON coupons FOR SELECT
  USING (status != 'deleted' AND is_active = true);

-- Note: Insert/Update/Delete policies should be added for admin users

-- Documentation
COMMENT ON TABLE coupons IS 'Discount coupons with codes, rates, and usage limits';
COMMENT ON COLUMN coupons.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN coupons.code IS 'Unique coupon code';
COMMENT ON COLUMN coupons.discount_type IS 'Type of discount: percentage or fixed_amount';
COMMENT ON COLUMN coupons.discount_value IS 'Discount value (percentage 0-100 or fixed amount)';
COMMENT ON COLUMN coupons.max_uses IS 'Maximum total uses (NULL = unlimited)';
COMMENT ON COLUMN coupons.max_uses_per_user IS 'Maximum uses per user';
COMMENT ON COLUMN coupons.usage_count IS 'Current usage count';
COMMENT ON COLUMN coupons.applicable_plans IS 'Array of plan IDs this coupon applies to (empty = all plans)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS coupons CASCADE;
