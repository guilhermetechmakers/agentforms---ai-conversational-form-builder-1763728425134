import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsApi } from '@/api/transactions'
import type { Transaction, TransactionInsert, TransactionUpdate } from '@/types/database/transactions'

export const useTransactions = () => {
  return useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: () => transactionsApi.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useTransaction = (id: string | null) => {
  return useQuery<Transaction | null>({
    queryKey: ['transactions', id],
    queryFn: () => (id ? transactionsApi.getById(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useCreateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation<Transaction, Error, TransactionInsert>({
    mutationFn: (transaction) => transactionsApi.create(transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation<Transaction, Error, { id: string; updates: TransactionUpdate }>({
    mutationFn: ({ id, updates }) => transactionsApi.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transactions', data.id] })
    },
  })
}
