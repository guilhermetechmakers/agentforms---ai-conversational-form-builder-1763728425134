/**
 * Database types for sample_prompts table
 * Generated: 2025-11-21T13:44:29Z
 */

export type PromptType = 
  | 'persona' 
  | 'field-phrasing' 
  | 'welcome-message' 
  | 'validation';

export type PromptCategory = 
  | 'sales' 
  | 'support' 
  | 'onboarding' 
  | 'feedback' 
  | 'survey' 
  | 'general';

export type PromptStatus = 'draft' | 'published' | 'archived';

export interface SamplePrompt {
  id: string;
  title: string;
  description: string | null;
  prompt_type: PromptType;
  content: string;
  category: PromptCategory | null;
  example_usage: string | null;
  usage_count: number;
  helpful_count: number;
  display_order: number;
  status: PromptStatus;
  created_at: string;
  updated_at: string;
}

export interface SamplePromptInsert {
  id?: string;
  title: string;
  description?: string | null;
  prompt_type: PromptType;
  content: string;
  category?: PromptCategory | null;
  example_usage?: string | null;
  usage_count?: number;
  helpful_count?: number;
  display_order?: number;
  status?: PromptStatus;
}

export interface SamplePromptUpdate {
  title?: string;
  description?: string | null;
  prompt_type?: PromptType;
  content?: string;
  category?: PromptCategory | null;
  example_usage?: string | null;
  usage_count?: number;
  helpful_count?: number;
  display_order?: number;
  status?: PromptStatus;
}

export type SamplePromptRow = SamplePrompt;
