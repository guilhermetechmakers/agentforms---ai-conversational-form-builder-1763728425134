import { supabase } from '@/lib/supabase'
import type { Plan, PlanInsert, PlanUpdate } from '@/types/database/plans'

export const plansApi = {
  /**
   * Get all active plans
   */
  async getAll(): Promise<Plan[]> {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .eq('status', 'active')
      .order('display_order', { ascending: true })

    if (error) {
      throw new Error(`Failed to get plans: ${error.message}`)
    }

    return (data || []) as Plan[]
  },

  /**
   * Get plan by ID
   */
  async getById(id: string): Promise<Plan | null> {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .eq('status', 'active')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get plan: ${error.message}`)
    }

    return data as Plan
  },

  /**
   * Get plan by slug
   */
  async getBySlug(slug: string): Promise<Plan | null> {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .eq('status', 'active')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get plan: ${error.message}`)
    }

    return data as Plan
  },

  /**
   * Create a new plan (admin only)
   */
  async create(plan: PlanInsert): Promise<Plan> {
    const { data, error } = await supabase
      .from('plans')
      .insert(plan)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create plan: ${error.message}`)
    }

    return data as Plan
  },

  /**
   * Update a plan (admin only)
   */
  async update(id: string, updates: PlanUpdate): Promise<Plan> {
    const { data, error } = await supabase
      .from('plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update plan: ${error.message}`)
    }

    return data as Plan
  },
}
