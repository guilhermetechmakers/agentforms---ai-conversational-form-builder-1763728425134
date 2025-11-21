/**
 * Database types for documentation table
 * Generated: 2025-11-21T13:44:27Z
 */

export type DocumentationCategory = 
  | 'getting-started' 
  | 'agents' 
  | 'webhooks' 
  | 'exports' 
  | 'privacy' 
  | 'api' 
  | 'integrations';

export type DocumentationStatus = 'draft' | 'published' | 'archived';

export interface Documentation {
  id: string;
  title: string;
  content: string;
  category: DocumentationCategory;
  slug: string;
  search_vector?: string;
  view_count: number;
  helpful_count: number;
  display_order: number;
  status: DocumentationStatus;
  created_at: string;
  updated_at: string;
}

export interface DocumentationInsert {
  id?: string;
  title: string;
  content: string;
  category: DocumentationCategory;
  slug: string;
  view_count?: number;
  helpful_count?: number;
  display_order?: number;
  status?: DocumentationStatus;
}

export interface DocumentationUpdate {
  title?: string;
  content?: string;
  category?: DocumentationCategory;
  slug?: string;
  view_count?: number;
  helpful_count?: number;
  display_order?: number;
  status?: DocumentationStatus;
}

export type DocumentationRow = Documentation;
