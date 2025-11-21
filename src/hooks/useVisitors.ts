import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { visitorsApi } from '@/api/visitors'
import type { CreateVisitorParams, UpdateConsentParams } from '@/api/visitors'
import type { VisitorUpdate } from '@/types/database/visitors'

export function useVisitor(id: string | null, enabled = true) {
  return useQuery({
    queryKey: ['visitors', id],
    queryFn: () => {
      if (!id) throw new Error('Visitor ID is required')
      return visitorsApi.getById(id)
    },
    enabled: enabled && !!id,
  })
}

export function useCreateOrGetVisitor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreateVisitorParams) => visitorsApi.createOrGet(params),
    onSuccess: (data) => {
      queryClient.setQueryData(['visitors', data.id], data)
    },
  })
}

export function useUpdateConsent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: UpdateConsentParams) => visitorsApi.updateConsent(params),
    onSuccess: (data) => {
      queryClient.setQueryData(['visitors', data.id], data)
    },
  })
}

export function useUpdateVisitor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: VisitorUpdate }) =>
      visitorsApi.update(id, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['visitors', data.id], data)
    },
  })
}
