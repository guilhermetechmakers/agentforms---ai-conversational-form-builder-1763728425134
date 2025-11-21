import { supabase } from '@/lib/supabase'
import type { Message } from '@/types/database/messages'

export interface SendMessageParams {
  session_id: string
  role: 'agent' | 'visitor'
  content: string
  field_key?: string | null
  field_value?: unknown | null
  attachment_url?: string | null
  attachment_type?: string | null
  metadata?: Record<string, unknown>
}

export const messagesApi = {
  /**
   * Send a message
   */
  async send(params: SendMessageParams): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        session_id: params.session_id,
        role: params.role,
        content: params.content,
        field_key: params.field_key || null,
        field_value: params.field_value || null,
        attachment_url: params.attachment_url || null,
        attachment_type: params.attachment_type || null,
        metadata: params.metadata || {},
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to send message: ${error.message}`)
    }

    return data as Message
  },

  /**
   * Get messages for a session
   */
  async getBySessionId(sessionId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to get messages: ${error.message}`)
    }

    return (data || []) as Message[]
  },

  /**
   * Subscribe to new messages for a session (real-time)
   */
  subscribeToSession(sessionId: string, callback: (message: Message) => void) {
    const channel = supabase
      .channel(`messages:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          callback(payload.new as Message)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}
