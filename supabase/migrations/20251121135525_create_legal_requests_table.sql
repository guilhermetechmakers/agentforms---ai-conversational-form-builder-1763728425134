-- =====================================================
-- Migration: Create legal_requests table
-- Created: 2025-11-21T13:55:25Z
-- Tables: legal_requests
-- Purpose: Store user legal requests (data deletion, inquiries, etc.)
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
-- TABLE: legal_requests
-- Purpose: Store user legal requests submitted from the Privacy & Terms page
-- =====================================================
CREATE TABLE IF NOT EXISTS legal_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- User information (optional for anonymous requests)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  
  -- Request details
  request_type TEXT NOT NULL CHECK (request_type IN ('data-deletion', 'data-export', 'data-inquiry', 'privacy-inquiry', 'other')),
  message TEXT NOT NULL,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'rejected')),
  
  -- Response tracking
  admin_response TEXT,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  responded_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT legal_requests_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT legal_requests_email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT legal_requests_message_not_empty CHECK (length(trim(message)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS legal_requests_user_id_idx ON legal_requests(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS legal_requests_email_idx ON legal_requests(email);
CREATE INDEX IF NOT EXISTS legal_requests_request_type_idx ON legal_requests(request_type);
CREATE INDEX IF NOT EXISTS legal_requests_status_idx ON legal_requests(status);
CREATE INDEX IF NOT EXISTS legal_requests_created_at_idx ON legal_requests(created_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS legal_requests_search_idx ON legal_requests USING gin(to_tsvector('english', name || ' ' || email || ' ' || message));

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_legal_requests_updated_at ON legal_requests;
CREATE TRIGGER update_legal_requests_updated_at
  BEFORE UPDATE ON legal_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE legal_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own requests
CREATE POLICY "legal_requests_select_own"
  ON legal_requests FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "legal_requests_insert_own"
  ON legal_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admins can access all requests (requires admin role check - implement via function)
-- For now, users can only see their own requests

-- Documentation
COMMENT ON TABLE legal_requests IS 'Legal requests submitted by users from the Privacy & Terms page';
COMMENT ON COLUMN legal_requests.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN legal_requests.user_id IS 'User who created the request (optional for anonymous requests)';
COMMENT ON COLUMN legal_requests.request_type IS 'Type of legal request';
COMMENT ON COLUMN legal_requests.status IS 'Current status of the request';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS legal_requests CASCADE;
