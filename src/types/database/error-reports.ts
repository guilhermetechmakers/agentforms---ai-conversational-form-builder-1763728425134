/**
 * Database types for error_reports table
 * Generated: 2025-11-21T14:06:40Z
 */

export type ErrorType = 'server_error' | 'client_error' | 'network_error' | 'unknown';
export type ErrorReportStatus = 'open' | 'reviewed' | 'resolved' | 'dismissed';

export interface ErrorReport {
  id: string;
  user_id: string | null;
  session_id: string | null;
  error_description: string | null;
  user_comments: string | null;
  error_type: ErrorType;
  error_code: string | null;
  error_stack: string | null;
  user_agent: string | null;
  url: string | null;
  referrer: string | null;
  status: ErrorReportStatus;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ErrorReportInsert {
  id?: string;
  user_id?: string | null;
  session_id?: string | null;
  error_description?: string | null;
  user_comments?: string | null;
  error_type?: ErrorType;
  error_code?: string | null;
  error_stack?: string | null;
  user_agent?: string | null;
  url?: string | null;
  referrer?: string | null;
  status?: ErrorReportStatus;
}

export interface ErrorReportUpdate {
  user_comments?: string | null;
  status?: ErrorReportStatus;
  admin_notes?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
}

export type ErrorReportRow = ErrorReport;
