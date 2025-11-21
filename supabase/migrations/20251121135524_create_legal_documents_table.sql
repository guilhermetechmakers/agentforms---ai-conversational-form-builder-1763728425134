-- =====================================================
-- Migration: Create legal_documents table
-- Created: 2025-11-21T13:55:24Z
-- Tables: legal_documents
-- Purpose: Store versioned legal documents (Privacy Policy, Terms of Service, Cookie Policy)
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
-- TABLE: legal_documents
-- Purpose: Store versioned legal documents for the Privacy & Terms page
-- =====================================================
CREATE TABLE IF NOT EXISTS legal_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Core fields
  document_type TEXT NOT NULL CHECK (document_type IN ('privacy-policy', 'terms-of-service', 'cookie-policy')),
  content TEXT NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  
  -- Metadata
  title TEXT,
  summary TEXT,
  effective_date DATE,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT legal_documents_content_not_empty CHECK (length(trim(content)) > 0),
  CONSTRAINT legal_documents_unique_active_version UNIQUE (document_type, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS legal_documents_document_type_idx ON legal_documents(document_type);
CREATE INDEX IF NOT EXISTS legal_documents_is_active_idx ON legal_documents(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS legal_documents_version_number_idx ON legal_documents(document_type, version_number DESC);
CREATE INDEX IF NOT EXISTS legal_documents_created_at_idx ON legal_documents(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_legal_documents_updated_at ON legal_documents;
CREATE TRIGGER update_legal_documents_updated_at
  BEFORE UPDATE ON legal_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Legal documents are publicly readable
CREATE POLICY "legal_documents_select_public"
  ON legal_documents FOR SELECT
  USING (true);

-- Only admins can insert/update (requires admin role check - implement via function)
-- For now, allow authenticated users with admin role
-- Note: This should be restricted to admin users only in production

-- Documentation
COMMENT ON TABLE legal_documents IS 'Versioned legal documents (Privacy Policy, Terms of Service, Cookie Policy)';
COMMENT ON COLUMN legal_documents.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN legal_documents.document_type IS 'Type of legal document';
COMMENT ON COLUMN legal_documents.content IS 'Full text content of the document';
COMMENT ON COLUMN legal_documents.version_number IS 'Version number of the document';
COMMENT ON COLUMN legal_documents.is_active IS 'Whether this version is currently active';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS legal_documents CASCADE;
