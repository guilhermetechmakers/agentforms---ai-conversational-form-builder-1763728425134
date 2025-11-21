/**
 * Database types for sessions table
 * Generated: 2025-11-21T14:13:27Z
 */

export type SessionStatus = 'in-progress' | 'completed' | 'abandoned'

export interface Session {
  id: string
  agent_id: string
  visitor_id: string | null
  status: SessionStatus
  visitor_metadata: Record<string, unknown>
  collected_data: Record<string, unknown>
  created_at: string
  updated_at: string
  completed_at: string | null
}

export interface SessionInsert {
  id?: string
  agent_id: string
  visitor_id?: string | null
  status?: SessionStatus
  visitor_metadata?: Record<string, unknown>
  collected_data?: Record<string, unknown>
  completed_at?: string | null
}

export interface SessionUpdate {
  visitor_id?: string | null
  status?: SessionStatus
  visitor_metadata?: Record<string, unknown>
  collected_data?: Record<string, unknown>
  completed_at?: string | null
}

export type SessionRow = Session
