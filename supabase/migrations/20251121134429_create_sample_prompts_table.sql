-- =====================================================
-- Migration: Create sample_prompts table
-- Created: 2025-11-21T13:44:29Z
-- Tables: sample_prompts
-- Purpose: Store sample persona and field phrasing templates for the About & Help page
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: sample_prompts
-- Purpose: Store sample prompts, personas, and templates
-- =====================================================
CREATE TABLE IF NOT EXISTS sample_prompts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Core fields
  title TEXT NOT NULL,
  description TEXT,
  prompt_type TEXT NOT NULL CHECK (prompt_type IN ('persona', 'field-phrasing', 'welcome-message', 'validation')),
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('sales', 'support', 'onboarding', 'feedback', 'survey', 'general')),
  
  -- Example usage
  example_usage TEXT,
  
  -- Metadata
  usage_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  
  -- Ordering
  display_order INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT sample_prompts_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT sample_prompts_content_not_empty CHECK (length(trim(content)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS sample_prompts_type_idx ON sample_prompts(prompt_type);
CREATE INDEX IF NOT EXISTS sample_prompts_category_idx ON sample_prompts(category);
CREATE INDEX IF NOT EXISTS sample_prompts_status_idx ON sample_prompts(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS sample_prompts_display_order_idx ON sample_prompts(display_order ASC);
CREATE INDEX IF NOT EXISTS sample_prompts_created_at_idx ON sample_prompts(created_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS sample_prompts_search_idx ON sample_prompts USING gin(to_tsvector('english', title || ' ' || coalesce(description, '') || ' ' || content));

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_sample_prompts_updated_at ON sample_prompts;
CREATE TRIGGER update_sample_prompts_updated_at
  BEFORE UPDATE ON sample_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE sample_prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: All users can read published sample prompts
CREATE POLICY "sample_prompts_select_published"
  ON sample_prompts FOR SELECT
  USING (status = 'published');

-- Documentation
COMMENT ON TABLE sample_prompts IS 'Sample prompts, personas, and templates for the About & Help page';
COMMENT ON COLUMN sample_prompts.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN sample_prompts.prompt_type IS 'Type of prompt (persona, field-phrasing, etc.)';
COMMENT ON COLUMN sample_prompts.category IS 'Category for organizing prompts';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS sample_prompts CASCADE;
