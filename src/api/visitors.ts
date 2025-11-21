import { supabase } from '@/lib/supabase'
import type { Visitor, VisitorUpdate } from '@/types/database/visitors'

export interface CreateVisitorParams {
  fingerprint?: string | null
  user_agent?: string | null
  referrer?: string | null
  ip_address?: string | null
  metadata?: Record<string, unknown>
}

export interface UpdateConsentParams {
  visitor_id: string
  consent_given: boolean
  consent_version?: string | null
}

export const visitorsApi = {
  /**
   * Create or get visitor by fingerprint
   */
  async createOrGet(params: CreateVisitorParams): Promise<Visitor> {
    // Try to find existing visitor by fingerprint
    if (params.fingerprint) {
      const { data: existing } = await supabase
        .from('visitors')
        .select('*')
        .eq('fingerprint', params.fingerprint)
        .single()

      if (existing) {
        return existing as Visitor
      }
    }

    // Create new visitor
    const { data, error } = await supabase
      .from('visitors')
      .insert({
        fingerprint: params.fingerprint || null,
        user_agent: params.user_agent || null,
        referrer: params.referrer || null,
        ip_address: params.ip_address || null,
        metadata: params.metadata || {},
        consent_given: false,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create visitor: ${error.message}`)
    }

    return data as Visitor
  },

  /**
   * Get visitor by ID
   */
  async getById(id: string): Promise<Visitor | null> {
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get visitor: ${error.message}`)
    }

    return data as Visitor
  },

  /**
   * Update visitor consent
   */
  async updateConsent(params: UpdateConsentParams): Promise<Visitor> {
    const { data, error } = await supabase
      .from('visitors')
      .update({
        consent_given: params.consent_given,
        consent_timestamp: params.consent_given ? new Date().toISOString() : null,
        consent_version: params.consent_version || null,
      })
      .eq('id', params.visitor_id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update consent: ${error.message}`)
    }

    return data as Visitor
  },

  /**
   * Update visitor
   */
  async update(id: string, updates: VisitorUpdate): Promise<Visitor> {
    const { data, error } = await supabase
      .from('visitors')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update visitor: ${error.message}`)
    }

    return data as Visitor
  },
}
