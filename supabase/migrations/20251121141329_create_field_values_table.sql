-- =====================================================
-- Migration: Create field_values table
-- Created: 2025-11-21T14:13:29Z
-- Tables: field_values
-- Purpose: Store validated field values collected during sessions
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: field_values
-- Purpose: Store validated field values collected during sessions
-- =====================================================
CREATE TABLE IF NOT EXISTS field_values (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  
  -- Field information
  field_key TEXT NOT NULL,
  value JSONB NOT NULL, -- Flexible value storage (text, number, array, etc.)
  
  -- Validation
  validated BOOLEAN DEFAULT false NOT NULL,
  validation_errors JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  collected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT field_values_field_key_not_empty CHECK (length(trim(field_key)) > 0),
  CONSTRAINT field_values_session_field_unique UNIQUE (session_id, field_key)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS field_values_session_id_idx ON field_values(session_id);
CREATE INDEX IF NOT EXISTS field_values_field_key_idx ON field_values(field_key);
CREATE INDEX IF NOT EXISTS field_values_validated_idx ON field_values(validated);
CREATE INDEX IF NOT EXISTS field_values_collected_at_idx ON field_values(collected_at DESC);

-- Composite index for session field queries
CREATE INDEX IF NOT EXISTS field_values_session_field_idx ON field_values(session_id, field_key);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_field_values_updated_at ON field_values;
CREATE TRIGGER update_field_values_updated_at
  BEFORE UPDATE ON field_values
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE field_values ENABLE ROW LEVEL SECURITY;

-- RLS Policies: 
-- - Agent owners can view field values for their agent's sessions
-- - Public can view field values for sessions (for visitor UI)
CREATE POLICY "field_values_select_agent_owner"
  ON field_values FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN agents ON agents.id = sessions.agent_id
      WHERE sessions.id = field_values.session_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "field_values_select_public"
  ON field_values FOR SELECT
  USING (true); -- Public field values are readable (for visitor UI)

CREATE POLICY "field_values_insert_public"
  ON field_values FOR INSERT
  WITH CHECK (true); -- Anyone can insert field values

CREATE POLICY "field_values_update_public"
  ON field_values FOR UPDATE
  USING (true)
  WITH CHECK (true); -- Anyone can update field values

-- Documentation
COMMENT ON TABLE field_values IS 'Validated field values collected during chat sessions';
COMMENT ON COLUMN field_values.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN field_values.session_id IS 'Session this field value belongs to';
COMMENT ON COLUMN field_values.field_key IS 'Field key from agent schema';
COMMENT ON COLUMN field_values.value IS 'Field value (JSONB for flexibility)';
COMMENT ON COLUMN field_values.validated IS 'Whether this value has been validated';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS field_values CASCADE;
