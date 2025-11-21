-- =====================================================
-- Migration: Create transactions table
-- Created: 2025-11-21T14:23:21Z
-- Tables: transactions
-- Purpose: Store payment transactions and subscription records
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
-- TABLE: transactions
-- Purpose: Store payment transactions and subscriptions
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Transaction identification
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('subscription', 'one_time', 'refund', 'adjustment')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
  
  -- Billing details
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Coupon
  coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
  coupon_code TEXT,
  
  -- Stripe integration
  stripe_payment_intent_id TEXT,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  stripe_invoice_id TEXT,
  
  -- Billing period
  billing_period_start TIMESTAMPTZ,
  billing_period_end TIMESTAMPTZ,
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
  
  -- Additional seats (if applicable)
  additional_seats INTEGER DEFAULT 0,
  
  -- Billing address (stored for invoice generation)
  billing_address JSONB,
  
  -- VAT/Tax information
  vat_number TEXT,
  tax_rate DECIMAL(5, 4) DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Error information
  error_message TEXT,
  error_code TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT transactions_amount_positive CHECK (amount >= 0),
  CONSTRAINT transactions_discount_amount_non_negative CHECK (discount_amount >= 0),
  CONSTRAINT transactions_tax_amount_non_negative CHECK (tax_amount >= 0),
  CONSTRAINT transactions_total_amount_positive CHECK (total_amount >= 0),
  CONSTRAINT transactions_additional_seats_non_negative CHECK (additional_seats >= 0),
  CONSTRAINT transactions_tax_rate_valid CHECK (tax_rate >= 0 AND tax_rate <= 1),
  CONSTRAINT transactions_billing_period_valid CHECK (
    billing_period_end IS NULL OR billing_period_start IS NULL OR billing_period_end > billing_period_start
  )
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_plan_id_idx ON transactions(plan_id);
CREATE INDEX IF NOT EXISTS transactions_coupon_id_idx ON transactions(coupon_id);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON transactions(status);
CREATE INDEX IF NOT EXISTS transactions_transaction_type_idx ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS transactions_stripe_payment_intent_id_idx ON transactions(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS transactions_stripe_subscription_id_idx ON transactions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS transactions_completed_at_idx ON transactions(completed_at DESC) WHERE completed_at IS NOT NULL;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own transactions
CREATE POLICY "transactions_select_own"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert_own"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_update_own"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Note: Delete policy should be restricted (transactions should not be deleted, only marked as cancelled/refunded)

-- Documentation
COMMENT ON TABLE transactions IS 'Payment transactions and subscription records';
COMMENT ON COLUMN transactions.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN transactions.user_id IS 'User who made the transaction (references auth.users)';
COMMENT ON COLUMN transactions.transaction_type IS 'Type of transaction: subscription, one_time, refund, or adjustment';
COMMENT ON COLUMN transactions.status IS 'Current status of the transaction';
COMMENT ON COLUMN transactions.plan_id IS 'Associated plan (references plans)';
COMMENT ON COLUMN transactions.stripe_payment_intent_id IS 'Stripe Payment Intent ID';
COMMENT ON COLUMN transactions.stripe_subscription_id IS 'Stripe Subscription ID';
COMMENT ON COLUMN transactions.billing_address IS 'Billing address for invoice generation (JSONB)';
COMMENT ON COLUMN transactions.metadata IS 'Additional transaction metadata (JSONB)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS transactions CASCADE;
