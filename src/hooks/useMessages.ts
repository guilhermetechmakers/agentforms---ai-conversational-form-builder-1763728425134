import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { messagesApi } from '@/api/messages'
import type { SendMessageParams } from '@/api/messages'
import type { Message } from '@/types/database/messages'

export function useMessages(sessionId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['messages', sessionId],
    queryFn: () => {
      if (!sessionId) throw new Error('Session ID is required')
      return messagesApi.getBySessionId(sessionId)
    },
    enabled: enabled && !!sessionId,
    refetchInterval: false, // We use real-time subscriptions instead
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: SendMessageParams) => messagesApi.send(params),
    onSuccess: (data) => {
      // Optimistically update the messages list
      queryClient.setQueryData<Message[]>(['messages', data.session_id], (old = []) => [
        ...old,
        data,
      ])
    },
  })
}

export function useSubscribeToMessages(
  sessionId: string | null,
  onNewMessage?: (message: Message) => void
) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!sessionId) return

    const unsubscribe = messagesApi.subscribeToSession(sessionId, (message) => {
      // Update the messages list
      queryClient.setQueryData<Message[]>(['messages', sessionId], (old = []) => {
        // Avoid duplicates
        if (old.some((m) => m.id === message.id)) {
          return old
        }
        return [...old, message]
      })

      // Call optional callback
      onNewMessage?.(message)
    })

    return () => {
      unsubscribe()
    }
  }, [sessionId, queryClient, onNewMessage])
}
