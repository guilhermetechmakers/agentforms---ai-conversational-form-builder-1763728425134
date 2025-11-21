import { supabase } from '@/lib/supabase'
import type { SupportTicket, SupportTicketInsert, SupportTicketUpdate } from '@/types/database/support-tickets'

export const supportTicketsApi = {
  /**
   * Create a new support ticket
   */
  async create(ticket: SupportTicketInsert): Promise<SupportTicket> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User must be authenticated to create a support ticket')
    }

    const ticketData: SupportTicketInsert = {
      ...ticket,
      user_id: user.id,
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .insert(ticketData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create support ticket: ${error.message}`)
    }

    return data as SupportTicket
  },

  /**
   * Get user's support tickets
   */
  async getMyTickets(): Promise<SupportTicket[]> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User must be authenticated to get support tickets')
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get support tickets: ${error.message}`)
    }

    return (data || []) as SupportTicket[]
  },

  /**
   * Get support ticket by ID
   */
  async getById(id: string): Promise<SupportTicket | null> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User must be authenticated to get support ticket')
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get support ticket: ${error.message}`)
    }

    return data as SupportTicket
  },

  /**
   * Update support ticket
   */
  async update(id: string, updates: SupportTicketUpdate): Promise<SupportTicket> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User must be authenticated to update support ticket')
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update support ticket: ${error.message}`)
    }

    return data as SupportTicket
  },
}
