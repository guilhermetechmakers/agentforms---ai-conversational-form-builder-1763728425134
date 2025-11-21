// Common types for AgentForms

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  schema: AgentSchema;
  persona?: PersonaConfig;
  knowledge?: KnowledgeConfig;
  visuals?: VisualConfig;
  published: boolean;
  public_url?: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface AgentSchema {
  fields: Field[];
}

export interface Field {
  id: string;
  key: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: ValidationRule;
  options?: string[]; // For select/multi-select
  help_text?: string;
  order: number;
}

export type FieldType = 
  | 'text' 
  | 'number' 
  | 'email' 
  | 'date' 
  | 'select' 
  | 'multi-select' 
  | 'attachment';

export interface ValidationRule {
  regex?: string;
  min?: number;
  max?: number;
  custom?: string;
}

export interface PersonaConfig {
  tone: string;
  welcome_message?: string;
  instructions?: string;
}

export interface KnowledgeConfig {
  text?: string;
  files?: string[];
  embeddings_enabled: boolean;
}

export interface VisualConfig {
  primary_color?: string;
  avatar_url?: string;
  logo_url?: string;
}

export interface Session {
  id: string;
  agent_id: string;
  status: SessionStatus;
  visitor_metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export type SessionStatus = 'in-progress' | 'completed' | 'abandoned';

export interface Message {
  id: string;
  session_id: string;
  role: 'agent' | 'visitor';
  content: string;
  field_key?: string;
  field_value?: unknown;
  created_at: string;
}

export interface FieldValue {
  id: string;
  session_id: string;
  field_key: string;
  value: unknown;
  validated: boolean;
  created_at: string;
}

export interface Webhook {
  id: string;
  agent_id?: string;
  url: string;
  headers?: Record<string, string>;
  auth_type?: 'none' | 'bearer' | 'basic';
  triggers: WebhookTrigger[];
  retry_policy?: RetryPolicy;
  enabled: boolean;
  created_at: string;
}

export type WebhookTrigger = 'on-update' | 'on-complete';

export interface RetryPolicy {
  max_retries: number;
  backoff_type: 'exponential' | 'linear';
  initial_delay: number;
}

// Export database types
export type { Plan, PlanInsert, PlanUpdate, PlanRow } from './database/plans'
export type { Coupon, CouponInsert, CouponUpdate, CouponRow } from './database/coupons'
export type { Transaction, TransactionInsert, TransactionUpdate, TransactionRow } from './database/transactions'
