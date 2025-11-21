-- =====================================================
-- Migration: Create plans table
-- Created: 2025-11-21T14:23:19Z
-- Tables: plans
-- Purpose: Store subscription plans with features, limits, and pricing
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
-- TABLE: plans
-- Purpose: Store subscription plans for billing
-- =====================================================
CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Plan identification
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  
  -- Pricing
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_yearly DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD' NOT NULL,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  
  -- Features and limits (JSONB for flexibility)
  features JSONB DEFAULT '[]'::jsonb,
  limits JSONB DEFAULT '{}'::jsonb,
  
  -- Plan metadata
  seat_pack_price DECIMAL(10, 2),
  is_enterprise BOOLEAN DEFAULT false NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT plans_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT plans_slug_not_empty CHECK (length(trim(slug)) > 0),
  CONSTRAINT plans_price_positive CHECK (price_monthly >= 0),
  CONSTRAINT plans_display_order_non_negative CHECK (display_order >= 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS plans_slug_idx ON plans(slug);
CREATE INDEX IF NOT EXISTS plans_status_idx ON plans(status) WHERE status != 'deleted';
CREATE INDEX IF NOT EXISTS plans_is_active_idx ON plans(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS plans_display_order_idx ON plans(display_order);
CREATE INDEX IF NOT EXISTS plans_created_at_idx ON plans(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Plans are publicly readable, but only admins can modify
CREATE POLICY "plans_select_all"
  ON plans FOR SELECT
  USING (status != 'deleted' AND is_active = true);

-- Note: Insert/Update/Delete policies should be added for admin users
-- This requires admin role checking which should be implemented in your auth system

-- Documentation
COMMENT ON TABLE plans IS 'Subscription plans with features, limits, and pricing';
COMMENT ON COLUMN plans.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN plans.name IS 'Display name of the plan';
COMMENT ON COLUMN plans.slug IS 'URL-friendly identifier';
COMMENT ON COLUMN plans.price_monthly IS 'Monthly subscription price';
COMMENT ON COLUMN plans.price_yearly IS 'Yearly subscription price (optional)';
COMMENT ON COLUMN plans.features IS 'Array of feature descriptions (JSONB)';
COMMENT ON COLUMN plans.limits IS 'Usage limits (sessions, agents, etc.) (JSONB)';
COMMENT ON COLUMN plans.stripe_price_id_monthly IS 'Stripe Price ID for monthly billing';
COMMENT ON COLUMN plans.stripe_price_id_yearly IS 'Stripe Price ID for yearly billing';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS plans CASCADE;
