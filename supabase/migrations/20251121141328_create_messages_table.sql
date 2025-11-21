-- =====================================================
-- Migration: Create messages table
-- Created: 2025-11-21T14:13:28Z
-- Tables: messages
-- Purpose: Store individual messages in chat sessions
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: messages
-- Purpose: Store individual messages in chat sessions
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  
  -- Message content
  role TEXT NOT NULL CHECK (role IN ('agent', 'visitor')),
  content TEXT NOT NULL,
  
  -- Field association (if message is collecting a field value)
  field_key TEXT,
  field_value JSONB,
  
  -- Attachments
  attachment_url TEXT,
  attachment_type TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT messages_content_not_empty CHECK (length(trim(content)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS messages_session_id_idx ON messages(session_id);
CREATE INDEX IF NOT EXISTS messages_role_idx ON messages(role);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at ASC);
CREATE INDEX IF NOT EXISTS messages_field_key_idx ON messages(field_key) WHERE field_key IS NOT NULL;

-- Composite index for common queries (session messages in order)
CREATE INDEX IF NOT EXISTS messages_session_created_idx ON messages(session_id, created_at ASC);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: 
-- - Agent owners can view messages for their agent's sessions
-- - Public can view messages for sessions (for visitor UI)
CREATE POLICY "messages_select_agent_owner"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN agents ON agents.id = sessions.agent_id
      WHERE sessions.id = messages.session_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "messages_select_public"
  ON messages FOR SELECT
  USING (true); -- Public messages are readable (for visitor UI)

CREATE POLICY "messages_insert_public"
  ON messages FOR INSERT
  WITH CHECK (true); -- Anyone can insert messages (for visitor and agent)

-- Documentation
COMMENT ON TABLE messages IS 'Individual messages in chat sessions';
COMMENT ON COLUMN messages.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN messages.session_id IS 'Session this message belongs to';
COMMENT ON COLUMN messages.role IS 'Sender role: agent or visitor';
COMMENT ON COLUMN messages.field_key IS 'Associated field key if message collects a field value';
COMMENT ON COLUMN messages.field_value IS 'Field value data (JSONB)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS messages CASCADE;
