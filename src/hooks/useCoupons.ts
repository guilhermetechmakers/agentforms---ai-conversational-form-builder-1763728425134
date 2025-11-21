import { useMutation, useQueryClient } from '@tanstack/react-query'
import { couponsApi } from '@/api/coupons'
import type { Coupon } from '@/types/database/coupons'
import { toast } from 'sonner'

export const useValidateCoupon = () => {
  const queryClient = useQueryClient()

  return useMutation<Coupon | null, Error, { code: string; planId?: string; amount?: number }>({
    mutationFn: ({ code, planId, amount }) => couponsApi.validate(code, planId, amount),
    onSuccess: (coupon, variables) => {
      if (coupon) {
        queryClient.setQueryData(['coupons', variables.code], coupon)
        toast.success('Coupon applied successfully')
      } else {
        toast.error('Invalid or expired coupon code')
      }
    },
    onError: (error) => {
      toast.error(`Failed to validate coupon: ${error.message}`)
    },
  })
}
