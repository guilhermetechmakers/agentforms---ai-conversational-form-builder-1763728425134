-- =====================================================
-- Migration: Create support_tickets table
-- Created: 2025-11-21T13:44:30Z
-- Tables: support_tickets
-- Purpose: Store user support tickets submitted from the About & Help page
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: support_tickets
-- Purpose: Store support tickets linked to users
-- =====================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core fields
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  session_id TEXT, -- Optional session ID for context
  
  -- Status tracking
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Response tracking
  admin_response TEXT,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  responded_at TIMESTAMPTZ,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  resolved_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT support_tickets_subject_not_empty CHECK (length(trim(subject)) > 0),
  CONSTRAINT support_tickets_description_not_empty CHECK (length(trim(description)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS support_tickets_user_id_idx ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON support_tickets(status);
CREATE INDEX IF NOT EXISTS support_tickets_priority_idx ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS support_tickets_created_at_idx ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS support_tickets_session_id_idx ON support_tickets(session_id) WHERE session_id IS NOT NULL;

-- Full-text search index
CREATE INDEX IF NOT EXISTS support_tickets_search_idx ON support_tickets USING gin(to_tsvector('english', subject || ' ' || description));

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own tickets
CREATE POLICY "support_tickets_select_own"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "support_tickets_insert_own"
  ON support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "support_tickets_update_own"
  ON support_tickets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can access all tickets (requires admin role check - implement via function)
-- For now, users can only see their own tickets

-- Documentation
COMMENT ON TABLE support_tickets IS 'Support tickets submitted by users from the About & Help page';
COMMENT ON COLUMN support_tickets.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN support_tickets.user_id IS 'User who created the ticket (references auth.users)';
COMMENT ON COLUMN support_tickets.session_id IS 'Optional session ID for context';
COMMENT ON COLUMN support_tickets.status IS 'Current status of the ticket';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS support_tickets CASCADE;
