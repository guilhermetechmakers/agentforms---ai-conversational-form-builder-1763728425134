/**
 * Database types for support_tickets table
 * Generated: 2025-11-21T13:44:30Z
 */

export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  session_id: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  admin_response: string | null;
  admin_user_id: string | null;
  responded_at: string | null;
  tags: string[];
  attachments: unknown[];
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface SupportTicketInsert {
  id?: string;
  user_id?: string;
  subject: string;
  description: string;
  session_id?: string | null;
  status?: TicketStatus;
  priority?: TicketPriority;
  tags?: string[];
  attachments?: unknown[];
}

export interface SupportTicketUpdate {
  subject?: string;
  description?: string;
  session_id?: string | null;
  status?: TicketStatus;
  priority?: TicketPriority;
  admin_response?: string | null;
  admin_user_id?: string | null;
  responded_at?: string | null;
  tags?: string[];
  attachments?: unknown[];
  resolved_at?: string | null;
}

export type SupportTicketRow = SupportTicket;
