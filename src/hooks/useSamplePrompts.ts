import { useQuery } from '@tanstack/react-query'
import { samplePromptsApi } from '@/api/sample-prompts'
import type { PromptType, PromptCategory } from '@/types/database/sample-prompts'

export function useSamplePrompts(
  promptType?: PromptType,
  category?: PromptCategory
) {
  return useQuery({
    queryKey: ['sample-prompts', promptType, category],
    queryFn: () => samplePromptsApi.getAll({ prompt_type: promptType, category }),
  })
}

export function useSamplePromptsSearch(
  query?: string,
  promptType?: PromptType,
  category?: PromptCategory
) {
  return useQuery({
    queryKey: ['sample-prompts', 'search', query, promptType, category],
    queryFn: () => samplePromptsApi.search({ query, prompt_type: promptType, category }),
    enabled: !!query || !!promptType || !!category,
  })
}
