import { supabase } from '@/lib/supabase'
import type { Coupon, CouponInsert, CouponUpdate } from '@/types/database/coupons'

export const couponsApi = {
  /**
   * Validate a coupon code
   */
  async validate(code: string, planId?: string, amount?: number): Promise<Coupon | null> {
    const now = new Date().toISOString()
    
    let query = supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .eq('status', 'active')
      .gte('valid_from', now)
      .or(`valid_until.is.null,valid_until.gte.${now}`)

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to validate coupon: ${error.message}`)
    }

    const coupon = data as Coupon

    // Check usage limits
    if (coupon.max_uses !== null && coupon.usage_count >= coupon.max_uses) {
      return null
    }

    // Check if coupon applies to this plan
    if (planId && coupon.applicable_plans.length > 0) {
      if (!coupon.applicable_plans.includes(planId)) {
        return null
      }
    }

    // Check minimum amount
    if (amount && coupon.minimum_amount !== null && amount < coupon.minimum_amount) {
      return null
    }

    return coupon
  },

  /**
   * Get coupon by code
   */
  async getByCode(code: string): Promise<Coupon | null> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get coupon: ${error.message}`)
    }

    return data as Coupon
  },

  /**
   * Increment coupon usage count
   */
  async incrementUsage(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_coupon_usage', { coupon_id: id })

    if (error) {
      // Fallback to manual update if RPC doesn't exist
      const { data: coupon } = await supabase
        .from('coupons')
        .select('usage_count')
        .eq('id', id)
        .single()

      if (coupon) {
        const { error: updateError } = await supabase
          .from('coupons')
          .update({ usage_count: coupon.usage_count + 1 })
          .eq('id', id)

        if (updateError) {
          throw new Error(`Failed to increment coupon usage: ${updateError.message}`)
        }
      }
    }
  },

  /**
   * Create a new coupon (admin only)
   */
  async create(coupon: CouponInsert): Promise<Coupon> {
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        ...coupon,
        code: coupon.code.toUpperCase(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create coupon: ${error.message}`)
    }

    return data as Coupon
  },

  /**
   * Update a coupon (admin only)
   */
  async update(id: string, updates: CouponUpdate): Promise<Coupon> {
    const updateData = { ...updates }
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase()
    }

    const { data, error } = await supabase
      .from('coupons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update coupon: ${error.message}`)
    }

    return data as Coupon
  },
}
