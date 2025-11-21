import { supabase } from '@/lib/supabase'
import type { SamplePrompt, PromptType, PromptCategory } from '@/types/database/sample-prompts'

export interface SearchSamplePromptsParams {
  query?: string
  prompt_type?: PromptType
  category?: PromptCategory
  limit?: number
}

export const samplePromptsApi = {
  /**
   * Get all published sample prompts
   */
  async getAll(params: SearchSamplePromptsParams = {}): Promise<SamplePrompt[]> {
    const { prompt_type, category, limit = 100 } = params

    let queryBuilder = supabase
      .from('sample_prompts')
      .select('*')
      .eq('status', 'published')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (prompt_type) {
      queryBuilder = queryBuilder.eq('prompt_type', prompt_type)
    }

    if (category) {
      queryBuilder = queryBuilder.eq('category', category)
    }

    const { data, error } = await queryBuilder

    if (error) {
      throw new Error(`Failed to get sample prompts: ${error.message}`)
    }

    return (data || []) as SamplePrompt[]
  },

  /**
   * Search sample prompts
   */
  async search(params: SearchSamplePromptsParams = {}): Promise<SamplePrompt[]> {
    const { query, prompt_type, category, limit = 50 } = params

    let queryBuilder = supabase
      .from('sample_prompts')
      .select('*')
      .eq('status', 'published')
      .order('display_order', { ascending: true })
      .limit(limit)

    if (prompt_type) {
      queryBuilder = queryBuilder.eq('prompt_type', prompt_type)
    }

    if (category) {
      queryBuilder = queryBuilder.eq('category', category)
    }

    if (query && query.trim()) {
      // Use full-text search
      queryBuilder = queryBuilder.textSearch('search_idx', query.trim(), {
        type: 'websearch',
        config: 'english',
      })
    }

    const { data, error } = await queryBuilder

    if (error) {
      throw new Error(`Failed to search sample prompts: ${error.message}`)
    }

    return (data || []) as SamplePrompt[]
  },

  /**
   * Get sample prompt by ID
   */
  async getById(id: string): Promise<SamplePrompt | null> {
    const { data, error } = await supabase
      .from('sample_prompts')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get sample prompt: ${error.message}`)
    }

    return data as SamplePrompt
  },
}
