import { api } from '@/lib/api'
import type { BillingAddress } from '@/types/database/transactions'

export interface PaymentIntentRequest {
  planId: string
  billingCycle: 'monthly' | 'yearly'
  couponCode?: string
  additionalSeats?: number
  billingAddress?: BillingAddress
  vatNumber?: string
}

export interface PaymentIntentResponse {
  clientSecret: string
  transactionId: string
  amount: number
  currency: string
}

export interface InvoiceCalculation {
  subtotal: number
  discount: number
  tax: number
  total: number
  currency: string
  breakdown: {
    planPrice: number
    additionalSeats: number
    discountAmount: number
    taxAmount: number
  }
}

export const billingApi = {
  /**
   * Create a Stripe payment intent
   */
  async createPaymentIntent(request: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    return api.post<PaymentIntentResponse>('/billing/payment-intent', request)
  },

  /**
   * Calculate invoice totals
   */
  async calculateInvoice(request: PaymentIntentRequest): Promise<InvoiceCalculation> {
    return api.post<InvoiceCalculation>('/billing/calculate', request)
  },

  /**
   * Confirm payment and complete transaction
   */
  async confirmPayment(transactionId: string, paymentIntentId: string): Promise<void> {
    return api.post(`/billing/confirm/${transactionId}`, { paymentIntentId })
  },

  /**
   * Get invoice download URL
   */
  async getInvoiceUrl(transactionId: string): Promise<{ url: string }> {
    return api.get<{ url: string }>(`/billing/invoice/${transactionId}`)
  },
}
