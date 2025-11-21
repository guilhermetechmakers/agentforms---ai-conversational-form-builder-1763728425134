/**
 * Database types for faqs table
 * Generated: 2025-11-21T13:44:28Z
 */

export type FAQCategory = 
  | 'general' 
  | 'agents' 
  | 'sessions' 
  | 'webhooks' 
  | 'billing' 
  | 'technical';

export type FAQStatus = 'draft' | 'published' | 'archived';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory | null;
  helpful_count: number;
  view_count: number;
  display_order: number;
  status: FAQStatus;
  created_at: string;
  updated_at: string;
}

export interface FAQInsert {
  id?: string;
  question: string;
  answer: string;
  category?: FAQCategory | null;
  helpful_count?: number;
  view_count?: number;
  display_order?: number;
  status?: FAQStatus;
}

export interface FAQUpdate {
  question?: string;
  answer?: string;
  category?: FAQCategory | null;
  helpful_count?: number;
  view_count?: number;
  display_order?: number;
  status?: FAQStatus;
}

export type FAQRow = FAQ;
