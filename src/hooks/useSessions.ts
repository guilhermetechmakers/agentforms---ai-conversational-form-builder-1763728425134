import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionsApi } from '@/api/sessions'
import type { CreateSessionParams, SessionUpdate } from '@/api/sessions'

export function useSession(id: string | null, enabled = true) {
  return useQuery({
    queryKey: ['sessions', id],
    queryFn: () => {
      if (!id) throw new Error('Session ID is required')
      return sessionsApi.getById(id)
    },
    enabled: enabled && !!id,
  })
}

export function useCreateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreateSessionParams) => sessionsApi.create(params),
    onSuccess: (data) => {
      queryClient.setQueryData(['sessions', data.id], data)
    },
  })
}

export function useUpdateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: SessionUpdate }) =>
      sessionsApi.update(id, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['sessions', data.id], data)
    },
  })
}

export function useCompleteSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => sessionsApi.complete(id),
    onSuccess: (data) => {
      queryClient.setQueryData(['sessions', data.id], data)
    },
  })
}
