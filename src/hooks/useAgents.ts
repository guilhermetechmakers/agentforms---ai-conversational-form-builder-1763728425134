import { useQuery } from '@tanstack/react-query'
import { agentsApi } from '@/api/agents'

export function useAgentByPublicUrl(publicUrl: string | null, enabled = true) {
  return useQuery({
    queryKey: ['agents', 'public-url', publicUrl],
    queryFn: () => {
      if (!publicUrl) throw new Error('Public URL is required')
      return agentsApi.getByPublicUrl(publicUrl)
    },
    enabled: enabled && !!publicUrl,
  })
}

export function useAgentById(id: string | null, enabled = true) {
  return useQuery({
    queryKey: ['agents', id],
    queryFn: () => {
      if (!id) throw new Error('Agent ID is required')
      return agentsApi.getById(id)
    },
    enabled: enabled && !!id,
  })
}
