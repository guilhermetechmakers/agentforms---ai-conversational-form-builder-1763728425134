import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supportTicketsApi } from '@/api/support-tickets'
import type { SupportTicketInsert } from '@/types/database/support-tickets'
import { toast } from 'sonner'

export function useMySupportTickets() {
  return useQuery({
    queryKey: ['support-tickets', 'my'],
    queryFn: () => supportTicketsApi.getMyTickets(),
  })
}

export function useSupportTicket(id: string, enabled = true) {
  return useQuery({
    queryKey: ['support-tickets', id],
    queryFn: () => supportTicketsApi.getById(id),
    enabled: enabled && !!id,
  })
}

export function useCreateSupportTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ticket: SupportTicketInsert) => supportTicketsApi.create(ticket),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
      toast.success('Support ticket created successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to create support ticket: ${error.message}`)
    },
  })
}
