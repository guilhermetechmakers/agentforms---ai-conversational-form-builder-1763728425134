-- =====================================================
-- Migration: Create agents table
-- Created: 2025-11-21T14:13:25Z
-- Tables: agents
-- Purpose: Store agent configurations with schema, persona, knowledge, and visuals
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
-- TABLE: agents
-- Purpose: Store agent configurations for conversational forms
-- =====================================================
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core fields
  name TEXT NOT NULL,
  description TEXT,
  
  -- Agent configuration (JSONB for flexibility)
  schema JSONB NOT NULL DEFAULT '{"fields": []}'::jsonb,
  persona JSONB DEFAULT '{}'::jsonb,
  knowledge JSONB DEFAULT '{}'::jsonb,
  visuals JSONB DEFAULT '{}'::jsonb,
  
  -- Publishing
  published BOOLEAN DEFAULT false NOT NULL,
  public_url TEXT UNIQUE,
  version INTEGER DEFAULT 1 NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT agents_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT agents_version_positive CHECK (version > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS agents_user_id_idx ON agents(user_id);
CREATE INDEX IF NOT EXISTS agents_public_url_idx ON agents(public_url) WHERE public_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS agents_published_idx ON agents(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS agents_created_at_idx ON agents(created_at DESC);
CREATE INDEX IF NOT EXISTS agents_status_idx ON agents(status) WHERE status != 'deleted';

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own agents, but published agents are publicly readable
CREATE POLICY "agents_select_own"
  ON agents FOR SELECT
  USING (auth.uid() = user_id OR (published = true AND status = 'active'));

CREATE POLICY "agents_insert_own"
  ON agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agents_update_own"
  ON agents FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agents_delete_own"
  ON agents FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE agents IS 'Agent configurations for conversational form builders';
COMMENT ON COLUMN agents.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN agents.user_id IS 'Owner of this agent (references auth.users)';
COMMENT ON COLUMN agents.schema IS 'Field schema definition (JSONB)';
COMMENT ON COLUMN agents.persona IS 'Persona and tone configuration (JSONB)';
COMMENT ON COLUMN agents.knowledge IS 'Knowledge base configuration (JSONB)';
COMMENT ON COLUMN agents.visuals IS 'Visual branding configuration (JSONB)';
COMMENT ON COLUMN agents.public_url IS 'Unique public URL for accessing this agent';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS agents CASCADE;
