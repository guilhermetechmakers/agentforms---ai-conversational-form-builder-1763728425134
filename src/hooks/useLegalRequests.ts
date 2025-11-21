import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { legalRequestsApi } from '@/api/legal-requests'
import type { LegalRequestInsert } from '@/types/database/legal-requests'
import { toast } from 'sonner'

export function useMyLegalRequests() {
  return useQuery({
    queryKey: ['legal-requests', 'my'],
    queryFn: () => legalRequestsApi.getMyRequests(),
  })
}

export function useLegalRequest(id: string, enabled = true) {
  return useQuery({
    queryKey: ['legal-requests', id],
    queryFn: () => legalRequestsApi.getById(id),
    enabled: enabled && !!id,
  })
}

export function useCreateLegalRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: LegalRequestInsert) => legalRequestsApi.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-requests'] })
      toast.success('Legal request submitted successfully. We will respond as soon as possible.')
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit legal request: ${error.message}`)
    },
  })
}
