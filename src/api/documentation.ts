import { supabase } from '@/lib/supabase'
import type { Documentation, DocumentationCategory } from '@/types/database/documentation'

export interface SearchDocumentationParams {
  query?: string
  category?: DocumentationCategory
  limit?: number
  offset?: number
}

export interface DocumentationSearchResult {
  data: Documentation[]
  total: number
}

export const documentationApi = {
  /**
   * Search documentation with full-text search
   */
  async search(params: SearchDocumentationParams = {}): Promise<DocumentationSearchResult> {
    const { query, category, limit = 20, offset = 0 } = params

    let queryBuilder = supabase
      .from('documentation')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category) {
      queryBuilder = queryBuilder.eq('category', category)
    }

    if (query && query.trim()) {
      // Use full-text search
      queryBuilder = queryBuilder.textSearch('search_vector', query.trim(), {
        type: 'websearch',
        config: 'english',
      })
    }

    const { data, error, count } = await queryBuilder

    if (error) {
      throw new Error(`Failed to search documentation: ${error.message}`)
    }

    return {
      data: (data || []) as Documentation[],
      total: count || 0,
    }
  },

  /**
   * Get documentation by ID
   */
  async getById(id: string): Promise<Documentation | null> {
    const { data, error } = await supabase
      .from('documentation')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get documentation: ${error.message}`)
    }

    return data as Documentation
  },

  /**
   * Get documentation by slug
   */
  async getBySlug(slug: string): Promise<Documentation | null> {
    const { data, error } = await supabase
      .from('documentation')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get documentation: ${error.message}`)
    }

    return data as Documentation
  },

  /**
   * Get documentation by category
   */
  async getByCategory(category: DocumentationCategory): Promise<Documentation[]> {
    const { data, error } = await supabase
      .from('documentation')
      .select('*')
      .eq('category', category)
      .eq('status', 'published')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get documentation: ${error.message}`)
    }

    return (data || []) as Documentation[]
  },

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_documentation_views', { doc_id: id })
    
    if (error) {
      // Fallback to manual update if RPC doesn't exist
      const { data } = await supabase
        .from('documentation')
        .select('view_count')
        .eq('id', id)
        .single()

      if (data) {
        await supabase
          .from('documentation')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', id)
      }
    }
  },
}
