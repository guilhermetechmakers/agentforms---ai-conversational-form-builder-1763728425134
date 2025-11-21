/**
 * Database types for legal_documents table
 * Generated: 2025-11-21T13:55:24Z
 */

export type DocumentType = 'privacy-policy' | 'terms-of-service' | 'cookie-policy';

export interface LegalDocument {
  id: string;
  document_type: DocumentType;
  content: string;
  version_number: number;
  title: string | null;
  summary: string | null;
  effective_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LegalDocumentInsert {
  id?: string;
  document_type: DocumentType;
  content: string;
  version_number?: number;
  title?: string | null;
  summary?: string | null;
  effective_date?: string | null;
  is_active?: boolean;
}

export interface LegalDocumentUpdate {
  content?: string;
  version_number?: number;
  title?: string | null;
  summary?: string | null;
  effective_date?: string | null;
  is_active?: boolean;
}

// Supabase query result type
export type LegalDocumentRow = LegalDocument;
