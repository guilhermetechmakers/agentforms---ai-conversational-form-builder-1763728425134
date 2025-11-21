import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fieldValuesApi } from '@/api/field-values'
import type { FieldValueInsert } from '@/types/database/field-values'

export function useFieldValues(sessionId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['field-values', sessionId],
    queryFn: () => {
      if (!sessionId) throw new Error('Session ID is required')
      return fieldValuesApi.getBySessionId(sessionId)
    },
    enabled: enabled && !!sessionId,
  })
}

export function useUpsertFieldValue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fieldValue: FieldValueInsert) => fieldValuesApi.upsert(fieldValue),
    onSuccess: (data) => {
      queryClient.setQueryData(['field-values', data.session_id], (old: any[] = []) => {
        const filtered = old.filter((fv) => fv.field_key !== data.field_key)
        return [...filtered, data]
      })
    },
  })
}

export function useUpdateFieldValueValidation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      sessionId,
      fieldKey,
      validated,
      validationErrors,
    }: {
      sessionId: string
      fieldKey: string
      validated: boolean
      validationErrors?: unknown[]
    }) =>
      fieldValuesApi.updateValidation(sessionId, fieldKey, validated, validationErrors || []),
    onSuccess: (data) => {
      queryClient.setQueryData(['field-values', data.session_id], (old: any[] = []) => {
        return old.map((fv) => (fv.field_key === data.field_key ? data : fv))
      })
    },
  })
}
