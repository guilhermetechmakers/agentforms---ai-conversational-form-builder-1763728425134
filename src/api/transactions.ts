import { supabase } from '@/lib/supabase'
import type { Transaction, TransactionInsert, TransactionUpdate } from '@/types/database/transactions'

export const transactionsApi = {
  /**
   * Get all transactions for the current user
   */
  async getAll(): Promise<Transaction[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get transactions: ${error.message}`)
    }

    return (data || []) as Transaction[]
  },

  /**
   * Get transaction by ID
   */
  async getById(id: string): Promise<Transaction | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get transaction: ${error.message}`)
    }

    return data as Transaction
  },

  /**
   * Create a new transaction
   */
  async create(transaction: TransactionInsert): Promise<Transaction> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transaction,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create transaction: ${error.message}`)
    }

    return data as Transaction
  },

  /**
   * Update a transaction
   */
  async update(id: string, updates: TransactionUpdate): Promise<Transaction> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update transaction: ${error.message}`)
    }

    return data as Transaction
  },

  /**
   * Get transaction by Stripe payment intent ID
   */
  async getByStripePaymentIntentId(paymentIntentId: string): Promise<Transaction | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get transaction: ${error.message}`)
    }

    return data as Transaction
  },
}
