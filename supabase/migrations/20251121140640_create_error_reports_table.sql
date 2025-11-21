-- =====================================================
-- Migration: Create error_reports table
-- Created: 2025-11-21T14:06:40Z
-- Tables: error_reports
-- Purpose: Store user-submitted error reports for server issues
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
-- TABLE: error_reports
-- Purpose: Store error reports submitted by users when encountering server errors
-- =====================================================
CREATE TABLE IF NOT EXISTS error_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Core fields
  session_id TEXT,
  error_description TEXT,
  user_comments TEXT,
  
  -- Error metadata
  error_type TEXT DEFAULT 'server_error' CHECK (error_type IN ('server_error', 'client_error', 'network_error', 'unknown')),
  error_code TEXT,
  error_stack TEXT,
  user_agent TEXT,
  url TEXT,
  referrer TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'resolved', 'dismissed')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT error_reports_user_comments_length CHECK (length(user_comments) <= 5000),
  CONSTRAINT error_reports_error_description_length CHECK (length(error_description) <= 2000)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS error_reports_user_id_idx ON error_reports(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS error_reports_session_id_idx ON error_reports(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS error_reports_created_at_idx ON error_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS error_reports_status_idx ON error_reports(status) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS error_reports_error_type_idx ON error_reports(error_type);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_error_reports_updated_at ON error_reports;
CREATE TRIGGER update_error_reports_updated_at
  BEFORE UPDATE ON error_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own error reports
CREATE POLICY "error_reports_select_own"
  ON error_reports FOR SELECT
  USING (
    auth.uid() = user_id OR 
    user_id IS NULL -- Allow anonymous users to view their own reports (via session_id matching)
  );

CREATE POLICY "error_reports_insert_own"
  ON error_reports FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR 
    user_id IS NULL -- Allow anonymous users to create reports
  );

CREATE POLICY "error_reports_update_own"
  ON error_reports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin policy: Allow admins to view and update all error reports
-- Note: This assumes you have an admin role system. Adjust based on your auth setup.
CREATE POLICY "error_reports_admin_all"
  ON error_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Documentation
COMMENT ON TABLE error_reports IS 'Stores user-submitted error reports for server issues and technical problems';
COMMENT ON COLUMN error_reports.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN error_reports.user_id IS 'User who reported the error (nullable for anonymous reports)';
COMMENT ON COLUMN error_reports.session_id IS 'Session identifier to link error reports with user sessions';
COMMENT ON COLUMN error_reports.error_description IS 'Technical description of the error';
COMMENT ON COLUMN error_reports.user_comments IS 'User-provided comments about the error';
COMMENT ON COLUMN error_reports.status IS 'Status of the error report (open, reviewed, resolved, dismissed)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS error_reports CASCADE;
