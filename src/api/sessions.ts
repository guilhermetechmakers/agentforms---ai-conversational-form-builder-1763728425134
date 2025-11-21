import { supabase } from '@/lib/supabase'
import type { Session, SessionUpdate } from '@/types/database/sessions'

export type { SessionUpdate }

export interface CreateSessionParams {
  agent_id: string
  visitor_id?: string | null
  visitor_metadata?: Record<string, unknown>
}

export const sessionsApi = {
  /**
   * Create a new session
   */
  async create(params: CreateSessionParams): Promise<Session> {
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        agent_id: params.agent_id,
        visitor_id: params.visitor_id || null,
        visitor_metadata: params.visitor_metadata || {},
        status: 'in-progress',
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`)
    }

    return data as Session
  },

  /**
   * Get session by ID
   */
  async getById(id: string): Promise<Session | null> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get session: ${error.message}`)
    }

    return data as Session
  },

  /**
   * Update a session
   */
  async update(id: string, updates: SessionUpdate): Promise<Session> {
    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update session: ${error.message}`)
    }

    return data as Session
  },

  /**
   * Complete a session
   */
  async complete(id: string): Promise<Session> {
    return this.update(id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
  },

  /**
   * Get sessions for an agent
   */
  async getByAgentId(agentId: string, limit = 50, offset = 0): Promise<{ data: Session[]; total: number }> {
    const { data, error, count } = await supabase
      .from('sessions')
      .select('*', { count: 'exact' })
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error(`Failed to get sessions: ${error.message}`)
    }

    return {
      data: (data || []) as Session[],
      total: count || 0,
    }
  },
}
