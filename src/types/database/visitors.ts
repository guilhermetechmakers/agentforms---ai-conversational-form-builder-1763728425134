/**
 * Database types for visitors table
 * Generated: 2025-11-21T14:13:26Z
 */

export interface Visitor {
  id: string
  fingerprint: string | null
  ip_address: string | null
  consent_given: boolean
  consent_timestamp: string | null
  consent_version: string | null
  user_agent: string | null
  referrer: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface VisitorInsert {
  id?: string
  fingerprint?: string | null
  ip_address?: string | null
  consent_given?: boolean
  consent_timestamp?: string | null
  consent_version?: string | null
  user_agent?: string | null
  referrer?: string | null
  metadata?: Record<string, unknown>
}

export interface VisitorUpdate {
  fingerprint?: string | null
  ip_address?: string | null
  consent_given?: boolean
  consent_timestamp?: string | null
  consent_version?: string | null
  user_agent?: string | null
  referrer?: string | null
  metadata?: Record<string, unknown>
}

export type VisitorRow = Visitor
