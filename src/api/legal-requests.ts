import { supabase } from '@/lib/supabase'
import type { LegalRequest, LegalRequestInsert } from '@/types/database/legal-requests'

export const legalRequestsApi = {
  /**
   * Create a new legal request
   * Can be submitted by authenticated or anonymous users
   */
  async create(request: LegalRequestInsert): Promise<LegalRequest> {
    // Try to get current user, but allow anonymous requests
    const { data: { user } } = await supabase.auth.getUser()
    
    const requestData: LegalRequestInsert = {
      ...request,
      user_id: user?.id || null,
    }

    const { data, error } = await supabase
      .from('legal_requests')
      .insert(requestData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create legal request: ${error.message}`)
    }

    return data as LegalRequest
  },

  /**
   * Get user's legal requests (if authenticated)
   */
  async getMyRequests(): Promise<LegalRequest[]> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return []
    }

    const { data, error } = await supabase
      .from('legal_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get legal requests: ${error.message}`)
    }

    return (data || []) as LegalRequest[]
  },

  /**
   * Get legal request by ID
   */
  async getById(id: string): Promise<LegalRequest | null> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User must be authenticated to get legal request')
    }

    const { data, error } = await supabase
      .from('legal_requests')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get legal request: ${error.message}`)
    }

    return data as LegalRequest
  },
}
