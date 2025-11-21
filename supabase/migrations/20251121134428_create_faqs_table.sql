-- =====================================================
-- Migration: Create FAQs table
-- Created: 2025-11-21T13:44:28Z
-- Tables: faqs
-- Purpose: Store frequently asked questions for the About & Help page
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: faqs
-- Purpose: Store FAQ questions and answers
-- =====================================================
CREATE TABLE IF NOT EXISTS faqs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Core fields
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT CHECK (category IN ('general', 'agents', 'sessions', 'webhooks', 'billing', 'technical')),
  
  -- Metadata
  helpful_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  -- Ordering
  display_order INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT faqs_question_not_empty CHECK (length(trim(question)) > 0),
  CONSTRAINT faqs_answer_not_empty CHECK (length(trim(answer)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS faqs_category_idx ON faqs(category);
CREATE INDEX IF NOT EXISTS faqs_status_idx ON faqs(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS faqs_display_order_idx ON faqs(display_order ASC);
CREATE INDEX IF NOT EXISTS faqs_created_at_idx ON faqs(created_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS faqs_question_answer_idx ON faqs USING gin(to_tsvector('english', question || ' ' || answer));

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_faqs_updated_at ON faqs;
CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: All users can read published FAQs
CREATE POLICY "faqs_select_published"
  ON faqs FOR SELECT
  USING (status = 'published');

-- Documentation
COMMENT ON TABLE faqs IS 'Frequently asked questions for the About & Help page';
COMMENT ON COLUMN faqs.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN faqs.category IS 'Category for organizing FAQs';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS faqs CASCADE;
