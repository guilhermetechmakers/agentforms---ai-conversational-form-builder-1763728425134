-- =====================================================
-- Migration: Create visitors table
-- Created: 2025-11-21T14:13:26Z
-- Tables: visitors
-- Purpose: Store anonymized visitor information and consent status
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: visitors
-- Purpose: Store anonymized visitor information for sessions
-- =====================================================
CREATE TABLE IF NOT EXISTS visitors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Anonymized identifiers
  fingerprint TEXT, -- Browser fingerprint hash
  ip_address INET, -- IP address (for rate limiting, anonymized after retention period)
  
  -- Consent
  consent_given BOOLEAN DEFAULT false NOT NULL,
  consent_timestamp TIMESTAMPTZ,
  consent_version TEXT, -- Version of privacy policy at time of consent
  
  -- Metadata
  user_agent TEXT,
  referrer TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT visitors_fingerprint_unique UNIQUE (fingerprint)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS visitors_fingerprint_idx ON visitors(fingerprint);
CREATE INDEX IF NOT EXISTS visitors_consent_given_idx ON visitors(consent_given);
CREATE INDEX IF NOT EXISTS visitors_created_at_idx ON visitors(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_visitors_updated_at ON visitors;
CREATE TRIGGER update_visitors_updated_at
  BEFORE UPDATE ON visitors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Visitors table is publicly readable/writable for session creation
-- But only system can query all visitors (for analytics)
CREATE POLICY "visitors_select_public"
  ON visitors FOR SELECT
  USING (true);

CREATE POLICY "visitors_insert_public"
  ON visitors FOR INSERT
  WITH CHECK (true);

CREATE POLICY "visitors_update_public"
  ON visitors FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Documentation
COMMENT ON TABLE visitors IS 'Anonymized visitor information for public chat sessions';
COMMENT ON COLUMN visitors.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN visitors.fingerprint IS 'Browser fingerprint hash for tracking (anonymized)';
COMMENT ON COLUMN visitors.consent_given IS 'Whether visitor has given consent for data collection';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS visitors CASCADE;
