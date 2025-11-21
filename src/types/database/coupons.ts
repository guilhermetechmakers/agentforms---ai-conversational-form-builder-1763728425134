/**
 * Database types for coupons table
 * Generated: 2025-11-21T14:23:20Z
 */

export type CouponStatus = 'active' | 'archived' | 'deleted'
export type DiscountType = 'percentage' | 'fixed_amount'

export interface Coupon {
  id: string
  code: string
  name: string
  description: string | null
  discount_type: DiscountType
  discount_value: number
  currency: string
  max_uses: number | null
  max_uses_per_user: number
  usage_count: number
  valid_from: string
  valid_until: string | null
  applicable_plans: string[]
  minimum_amount: number | null
  is_active: boolean
  status: CouponStatus
  created_at: string
  updated_at: string
}

export interface CouponInsert {
  id?: string
  code: string
  name: string
  description?: string | null
  discount_type: DiscountType
  discount_value: number
  currency?: string
  max_uses?: number | null
  max_uses_per_user?: number
  usage_count?: number
  valid_from?: string
  valid_until?: string | null
  applicable_plans?: string[]
  minimum_amount?: number | null
  is_active?: boolean
  status?: CouponStatus
}

export interface CouponUpdate {
  code?: string
  name?: string
  description?: string | null
  discount_type?: DiscountType
  discount_value?: number
  currency?: string
  max_uses?: number | null
  max_uses_per_user?: number
  usage_count?: number
  valid_from?: string
  valid_until?: string | null
  applicable_plans?: string[]
  minimum_amount?: number | null
  is_active?: boolean
  status?: CouponStatus
}

export type CouponRow = Coupon
