/**
 * Database types for legal_requests table
 * Generated: 2025-11-21T13:55:25Z
 */

export type RequestType = 'data-deletion' | 'data-export' | 'data-inquiry' | 'privacy-inquiry' | 'other';
export type RequestStatus = 'pending' | 'in-progress' | 'completed' | 'rejected';

export interface LegalRequest {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  request_type: RequestType;
  message: string;
  status: RequestStatus;
  admin_response: string | null;
  admin_user_id: string | null;
  responded_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface LegalRequestInsert {
  id?: string;
  user_id?: string | null;
  name: string;
  email: string;
  request_type: RequestType;
  message: string;
  status?: RequestStatus;
  metadata?: Record<string, any>;
}

export interface LegalRequestUpdate {
  status?: RequestStatus;
  admin_response?: string | null;
  admin_user_id?: string | null;
  responded_at?: string | null;
  completed_at?: string | null;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type LegalRequestRow = LegalRequest;
