/**
 * Database types for messages table
 * Generated: 2025-11-21T14:13:28Z
 */

export type MessageRole = 'agent' | 'visitor'

export interface Message {
  id: string
  session_id: string
  role: MessageRole
  content: string
  field_key: string | null
  field_value: unknown | null
  attachment_url: string | null
  attachment_type: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface MessageInsert {
  id?: string
  session_id: string
  role: MessageRole
  content: string
  field_key?: string | null
  field_value?: unknown | null
  attachment_url?: string | null
  attachment_type?: string | null
  metadata?: Record<string, unknown>
}

export interface MessageUpdate {
  content?: string
  field_key?: string | null
  field_value?: unknown | null
  attachment_url?: string | null
  attachment_type?: string | null
  metadata?: Record<string, unknown>
}

export type MessageRow = Message
