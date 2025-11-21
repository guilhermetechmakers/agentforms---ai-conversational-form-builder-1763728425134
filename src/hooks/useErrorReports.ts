import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { errorReportsApi } from '@/api/error-reports'
import type { ErrorReportInsert } from '@/types/database/error-reports'
import { toast } from 'sonner'

export function useMyErrorReports() {
  return useQuery({
    queryKey: ['error-reports', 'my'],
    queryFn: () => errorReportsApi.getMyReports(),
  })
}

export function useErrorReport(id: string, enabled = true) {
  return useQuery({
    queryKey: ['error-reports', id],
    queryFn: () => errorReportsApi.getById(id),
    enabled: enabled && !!id,
  })
}

export function useCreateErrorReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (report: ErrorReportInsert) => errorReportsApi.create(report),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['error-reports'] })
      toast.success('Error report submitted successfully. Thank you for helping us improve!')
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit error report: ${error.message}`)
    },
  })
}
