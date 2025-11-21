import { supabase } from '@/lib/supabase'
import type { Agent, AgentInsert, AgentUpdate } from '@/types/database/agents'

export const agentsApi = {
  /**
   * Get agent by public URL (for public chat access)
   */
  async getByPublicUrl(publicUrl: string): Promise<Agent | null> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('public_url', publicUrl)
      .eq('published', true)
      .eq('status', 'active')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get agent: ${error.message}`)
    }

    return data as Agent
  },

  /**
   * Get agent by ID
   */
  async getById(id: string): Promise<Agent | null> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get agent: ${error.message}`)
    }

    return data as Agent
  },

  /**
   * Create a new agent
   */
  async create(agent: AgentInsert): Promise<Agent> {
    const { data, error } = await supabase
      .from('agents')
      .insert(agent)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create agent: ${error.message}`)
    }

    return data as Agent
  },

  /**
   * Update an agent
   */
  async update(id: string, updates: AgentUpdate): Promise<Agent> {
    const { data, error } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update agent: ${error.message}`)
    }

    return data as Agent
  },

  /**
   * Delete an agent (soft delete)
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('agents')
      .update({ status: 'deleted' })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete agent: ${error.message}`)
    }
  },
}
