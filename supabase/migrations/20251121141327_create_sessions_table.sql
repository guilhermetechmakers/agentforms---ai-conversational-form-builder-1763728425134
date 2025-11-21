-- =====================================================
-- Migration: Create sessions table
-- Created: 2025-11-21T14:13:27Z
-- Tables: sessions
-- Purpose: Store chat sessions between visitors and agents
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: sessions
-- Purpose: Store chat sessions for agent conversations
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
  
  -- Session status
  status TEXT DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'abandoned')) NOT NULL,
  
  -- Visitor metadata
  visitor_metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Session data
  collected_data JSONB DEFAULT '{}'::jsonb, -- Structured field values
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT sessions_agent_id_not_null CHECK (agent_id IS NOT NULL)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS sessions_agent_id_idx ON sessions(agent_id);
CREATE INDEX IF NOT EXISTS sessions_visitor_id_idx ON sessions(visitor_id);
CREATE INDEX IF NOT EXISTS sessions_status_idx ON sessions(status);
CREATE INDEX IF NOT EXISTS sessions_created_at_idx ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS sessions_completed_at_idx ON sessions(completed_at DESC) WHERE completed_at IS NOT NULL;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: 
-- - Agent owners can view all sessions for their agents
-- - Public can create sessions (for visitor access)
-- - Visitors can view their own sessions via visitor_id
CREATE POLICY "sessions_select_agent_owner"
  ON sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = sessions.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "sessions_select_visitor"
  ON sessions FOR SELECT
  USING (true); -- Public sessions are readable (for visitor UI)

CREATE POLICY "sessions_insert_public"
  ON sessions FOR INSERT
  WITH CHECK (true); -- Anyone can create a session

CREATE POLICY "sessions_update_agent_owner"
  ON sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = sessions.agent_id 
      AND agents.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = sessions.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

-- Documentation
COMMENT ON TABLE sessions IS 'Chat sessions between visitors and agents';
COMMENT ON COLUMN sessions.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN sessions.agent_id IS 'Agent this session belongs to';
COMMENT ON COLUMN sessions.visitor_id IS 'Visitor who started this session';
COMMENT ON COLUMN sessions.status IS 'Current status of the session';
COMMENT ON COLUMN sessions.collected_data IS 'Structured field values collected during conversation';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS sessions CASCADE;
