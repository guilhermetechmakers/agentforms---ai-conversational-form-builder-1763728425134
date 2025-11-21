/**
 * Database types for transactions table
 * Generated: 2025-11-21T14:23:21Z
 */

export type TransactionType = 'subscription' | 'one_time' | 'refund' | 'adjustment'
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
export type BillingCycle = 'monthly' | 'yearly'

export interface BillingAddress {
  line1: string
  line2?: string
  city: string
  state?: string
  postal_code: string
  country: string
}

export interface TransactionMetadata {
  [key: string]: any
}

export interface Transaction {
  id: string
  user_id: string
  transaction_type: TransactionType
  status: TransactionStatus
  plan_id: string | null
  amount: number
  currency: string
  discount_amount: number
  tax_amount: number
  total_amount: number
  coupon_id: string | null
  coupon_code: string | null
  stripe_payment_intent_id: string | null
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  stripe_invoice_id: string | null
  billing_period_start: string | null
  billing_period_end: string | null
  billing_cycle: BillingCycle | null
  additional_seats: number
  billing_address: BillingAddress | null
  vat_number: string | null
  tax_rate: number
  metadata: TransactionMetadata
  error_message: string | null
  error_code: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

export interface TransactionInsert {
  id?: string
  user_id?: string // Optional - will be set by API from auth context
  transaction_type: TransactionType
  status?: TransactionStatus
  plan_id?: string | null
  amount: number
  currency?: string
  discount_amount?: number
  tax_amount?: number
  total_amount: number
  coupon_id?: string | null
  coupon_code?: string | null
  stripe_payment_intent_id?: string | null
  stripe_subscription_id?: string | null
  stripe_customer_id?: string | null
  stripe_invoice_id?: string | null
  billing_period_start?: string | null
  billing_period_end?: string | null
  billing_cycle?: BillingCycle | null
  additional_seats?: number
  billing_address?: BillingAddress | null
  vat_number?: string | null
  tax_rate?: number
  metadata?: TransactionMetadata
  error_message?: string | null
  error_code?: string | null
  completed_at?: string | null
}

export interface TransactionUpdate {
  transaction_type?: TransactionType
  status?: TransactionStatus
  plan_id?: string | null
  amount?: number
  currency?: string
  discount_amount?: number
  tax_amount?: number
  total_amount?: number
  coupon_id?: string | null
  coupon_code?: string | null
  stripe_payment_intent_id?: string | null
  stripe_subscription_id?: string | null
  stripe_customer_id?: string | null
  stripe_invoice_id?: string | null
  billing_period_start?: string | null
  billing_period_end?: string | null
  billing_cycle?: BillingCycle | null
  additional_seats?: number
  billing_address?: BillingAddress | null
  vat_number?: string | null
  tax_rate?: number
  metadata?: TransactionMetadata
  error_message?: string | null
  error_code?: string | null
  completed_at?: string | null
}

export type TransactionRow = Transaction
