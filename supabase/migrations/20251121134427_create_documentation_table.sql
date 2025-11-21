-- =====================================================
-- Migration: Create documentation table
-- Created: 2025-11-21T13:44:27Z
-- Tables: documentation
-- Purpose: Store searchable documentation articles for the About & Help page
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
-- TABLE: documentation
-- Purpose: Store documentation articles with categories for searchability
-- =====================================================
CREATE TABLE IF NOT EXISTS documentation (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Core fields
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('getting-started', 'agents', 'webhooks', 'exports', 'privacy', 'api', 'integrations')),
  slug TEXT UNIQUE NOT NULL,
  
  -- Metadata
  search_vector tsvector,
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  
  -- Ordering
  display_order INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT documentation_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT documentation_content_not_empty CHECK (length(trim(content)) > 0),
  CONSTRAINT documentation_slug_not_empty CHECK (length(trim(slug)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS documentation_category_idx ON documentation(category);
CREATE INDEX IF NOT EXISTS documentation_status_idx ON documentation(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS documentation_created_at_idx ON documentation(created_at DESC);
CREATE INDEX IF NOT EXISTS documentation_search_vector_idx ON documentation USING gin(search_vector);

-- Full-text search index
CREATE INDEX IF NOT EXISTS documentation_title_content_idx ON documentation USING gin(to_tsvector('english', title || ' ' || content));

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_documentation_updated_at ON documentation;
CREATE TRIGGER update_documentation_updated_at
  BEFORE UPDATE ON documentation
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update search_vector on insert/update
CREATE OR REPLACE FUNCTION update_documentation_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', coalesce(NEW.title, '') || ' ' || coalesce(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS documentation_search_vector_update ON documentation;
CREATE TRIGGER documentation_search_vector_update
  BEFORE INSERT OR UPDATE ON documentation
  FOR EACH ROW
  EXECUTE FUNCTION update_documentation_search_vector();

-- Enable Row Level Security
ALTER TABLE documentation ENABLE ROW LEVEL SECURITY;

-- RLS Policies: All users can read published documentation
CREATE POLICY "documentation_select_published"
  ON documentation FOR SELECT
  USING (status = 'published');

-- Documentation
COMMENT ON TABLE documentation IS 'Documentation articles for the About & Help page';
COMMENT ON COLUMN documentation.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN documentation.category IS 'Category for organizing documentation';
COMMENT ON COLUMN documentation.search_vector IS 'Full-text search vector for fast searching';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS documentation CASCADE;
