import { useQuery } from '@tanstack/react-query'
import { documentationApi } from '@/api/documentation'
import type { DocumentationCategory } from '@/types/database/documentation'

export function useDocumentationSearch(
  query?: string,
  category?: DocumentationCategory,
  enabled = true
) {
  return useQuery({
    queryKey: ['documentation', 'search', query, category],
    queryFn: () => documentationApi.search({ query, category }),
    enabled: enabled && (!!query || !!category),
  })
}

export function useDocumentationByCategory(category: DocumentationCategory) {
  return useQuery({
    queryKey: ['documentation', 'category', category],
    queryFn: () => documentationApi.getByCategory(category),
  })
}

export function useDocumentationBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: ['documentation', 'slug', slug],
    queryFn: () => documentationApi.getBySlug(slug),
    enabled: enabled && !!slug,
  })
}
