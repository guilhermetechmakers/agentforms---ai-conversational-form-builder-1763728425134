/**
 * Database types for agents table
 * Generated: 2025-11-21T14:13:25Z
 */

import type { AgentSchema, PersonaConfig, KnowledgeConfig, VisualConfig } from '@/types'

export type AgentStatus = 'active' | 'archived' | 'deleted'

export interface Agent {
  id: string
  user_id: string
  name: string
  description: string | null
  schema: AgentSchema
  persona: PersonaConfig | null
  knowledge: KnowledgeConfig | null
  visuals: VisualConfig | null
  published: boolean
  public_url: string | null
  version: number
  status: AgentStatus
  created_at: string
  updated_at: string
}

export interface AgentInsert {
  id?: string
  user_id: string
  name: string
  description?: string | null
  schema?: AgentSchema
  persona?: PersonaConfig | null
  knowledge?: KnowledgeConfig | null
  visuals?: VisualConfig | null
  published?: boolean
  public_url?: string | null
  version?: number
  status?: AgentStatus
}

export interface AgentUpdate {
  name?: string
  description?: string | null
  schema?: AgentSchema
  persona?: PersonaConfig | null
  knowledge?: KnowledgeConfig | null
  visuals?: VisualConfig | null
  published?: boolean
  public_url?: string | null
  version?: number
  status?: AgentStatus
}

export type AgentRow = Agent
