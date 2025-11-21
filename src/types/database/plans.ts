/**
 * Database types for plans table
 * Generated: 2025-11-21T14:23:19Z
 */

export type PlanStatus = 'active' | 'archived' | 'deleted'

export interface PlanFeatures {
  [key: string]: boolean | number | string
}

export interface PlanLimits {
  agents?: number
  sessions_per_month?: number
  messages_per_session?: number
  knowledge_base_size_mb?: number
  webhooks?: number
  team_members?: number
  [key: string]: number | undefined
}

export interface Plan {
  id: string
  name: string
  slug: string
  description: string | null
  price_monthly: number
  price_yearly: number | null
  currency: string
  stripe_price_id_monthly: string | null
  stripe_price_id_yearly: string | null
  features: PlanFeatures
  limits: PlanLimits
  seat_pack_price: number | null
  is_enterprise: boolean
  is_active: boolean
  display_order: number
  status: PlanStatus
  created_at: string
  updated_at: string
}

export interface PlanInsert {
  id?: string
  name: string
  slug: string
  description?: string | null
  price_monthly: number
  price_yearly?: number | null
  currency?: string
  stripe_price_id_monthly?: string | null
  stripe_price_id_yearly?: string | null
  features?: PlanFeatures
  limits?: PlanLimits
  seat_pack_price?: number | null
  is_enterprise?: boolean
  is_active?: boolean
  display_order?: number
  status?: PlanStatus
}

export interface PlanUpdate {
  name?: string
  slug?: string
  description?: string | null
  price_monthly?: number
  price_yearly?: number | null
  currency?: string
  stripe_price_id_monthly?: string | null
  stripe_price_id_yearly?: string | null
  features?: PlanFeatures
  limits?: PlanLimits
  seat_pack_price?: number | null
  is_enterprise?: boolean
  is_active?: boolean
  display_order?: number
  status?: PlanStatus
}

export type PlanRow = Plan
