import { supabase } from '@/lib/supabase'
import type { FAQ, FAQCategory } from '@/types/database/faqs'

export interface SearchFAQsParams {
  query?: string
  category?: FAQCategory
  limit?: number
}

export const faqsApi = {
  /**
   * Get all published FAQs
   */
  async getAll(category?: FAQCategory): Promise<FAQ[]> {
    let queryBuilder = supabase
      .from('faqs')
      .select('*')
      .eq('status', 'published')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (category) {
      queryBuilder = queryBuilder.eq('category', category)
    }

    const { data, error } = await queryBuilder

    if (error) {
      throw new Error(`Failed to get FAQs: ${error.message}`)
    }

    return (data || []) as FAQ[]
  },

  /**
   * Search FAQs
   */
  async search(params: SearchFAQsParams = {}): Promise<FAQ[]> {
    const { query, category, limit = 50 } = params

    let queryBuilder = supabase
      .from('faqs')
      .select('*')
      .eq('status', 'published')
      .order('display_order', { ascending: true })
      .limit(limit)

    if (category) {
      queryBuilder = queryBuilder.eq('category', category)
    }

    if (query && query.trim()) {
      // Use full-text search
      queryBuilder = queryBuilder.textSearch('question_answer_idx', query.trim(), {
        type: 'websearch',
        config: 'english',
      })
    }

    const { data, error } = await queryBuilder

    if (error) {
      throw new Error(`Failed to search FAQs: ${error.message}`)
    }

    return (data || []) as FAQ[]
  },

  /**
   * Get FAQ by ID
   */
  async getById(id: string): Promise<FAQ | null> {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get FAQ: ${error.message}`)
    }

    return data as FAQ
  },

  /**
   * Increment helpful count
   */
  async incrementHelpfulCount(id: string): Promise<void> {
    const { data } = await supabase
      .from('faqs')
      .select('helpful_count')
      .eq('id', id)
      .single()

    if (data) {
      await supabase
        .from('faqs')
        .update({ helpful_count: (data.helpful_count || 0) + 1 })
        .eq('id', id)
    }
  },
}
