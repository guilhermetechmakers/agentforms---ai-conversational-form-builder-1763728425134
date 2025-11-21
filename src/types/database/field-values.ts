/**
 * Database types for field_values table
 * Generated: 2025-11-21T14:13:29Z
 */

export interface FieldValue {
  id: string
  session_id: string
  field_key: string
  value: unknown
  validated: boolean
  validation_errors: unknown[]
  collected_at: string
  updated_at: string
}

export interface FieldValueInsert {
  id?: string
  session_id: string
  field_key: string
  value: unknown
  validated?: boolean
  validation_errors?: unknown[]
  collected_at?: string
}

export interface FieldValueUpdate {
  value?: unknown
  validated?: boolean
  validation_errors?: unknown[]
}

export type FieldValueRow = FieldValue
