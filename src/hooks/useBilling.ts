import { useMutation } from '@tanstack/react-query'
import { billingApi } from '@/api/billing'
import type {
  PaymentIntentRequest,
  PaymentIntentResponse,
  InvoiceCalculation,
} from '@/api/billing'
import { toast } from 'sonner'

export const useCreatePaymentIntent = () => {
  return useMutation<PaymentIntentResponse, Error, PaymentIntentRequest>({
    mutationFn: (request) => billingApi.createPaymentIntent(request),
    onError: (error) => {
      toast.error(`Failed to create payment intent: ${error.message}`)
    },
  })
}

export const useCalculateInvoice = () => {
  return useMutation<InvoiceCalculation, Error, PaymentIntentRequest>({
    mutationFn: (request) => billingApi.calculateInvoice(request),
    onError: (error) => {
      toast.error(`Failed to calculate invoice: ${error.message}`)
    },
  })
}

export const useConfirmPayment = () => {
  return useMutation<void, Error, { transactionId: string; paymentIntentId: string }>({
    mutationFn: ({ transactionId, paymentIntentId }) =>
      billingApi.confirmPayment(transactionId, paymentIntentId),
    onSuccess: () => {
      toast.success('Payment confirmed successfully')
    },
    onError: (error) => {
      toast.error(`Failed to confirm payment: ${error.message}`)
    },
  })
}
