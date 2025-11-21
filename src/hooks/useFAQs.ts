import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { faqsApi } from '@/api/faqs'
import type { FAQCategory } from '@/types/database/faqs'

export function useFAQs(category?: FAQCategory) {
  return useQuery({
    queryKey: ['faqs', category],
    queryFn: () => faqsApi.getAll(category),
  })
}

export function useFAQSearch(query?: string, category?: FAQCategory) {
  return useQuery({
    queryKey: ['faqs', 'search', query, category],
    queryFn: () => faqsApi.search({ query, category }),
    enabled: !!query || !!category,
  })
}

export function useIncrementFAQHelpful() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => faqsApi.incrementHelpfulCount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] })
    },
  })
}
