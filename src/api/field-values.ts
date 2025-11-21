import { supabase } from '@/lib/supabase'
import type { FieldValue, FieldValueInsert } from '@/types/database/field-values'

export const fieldValuesApi = {
  /**
   * Create or update a field value
   */
  async upsert(fieldValue: FieldValueInsert): Promise<FieldValue> {
    const { data, error } = await supabase
      .from('field_values')
      .upsert(
        {
          session_id: fieldValue.session_id,
          field_key: fieldValue.field_key,
          value: fieldValue.value,
          validated: fieldValue.validated ?? false,
          validation_errors: fieldValue.validation_errors || [],
        },
        {
          onConflict: 'session_id,field_key',
        }
      )
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to upsert field value: ${error.message}`)
    }

    return data as FieldValue
  },

  /**
   * Get field values for a session
   */
  async getBySessionId(sessionId: string): Promise<FieldValue[]> {
    const { data, error } = await supabase
      .from('field_values')
      .select('*')
      .eq('session_id', sessionId)
      .order('collected_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to get field values: ${error.message}`)
    }

    return (data || []) as FieldValue[]
  },

  /**
   * Update field value validation
   */
  async updateValidation(
    sessionId: string,
    fieldKey: string,
    validated: boolean,
    validationErrors: unknown[] = []
  ): Promise<FieldValue> {
    const { data, error } = await supabase
      .from('field_values')
      .update({
        validated,
        validation_errors: validationErrors,
      })
      .eq('session_id', sessionId)
      .eq('field_key', fieldKey)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update field value validation: ${error.message}`)
    }

    return data as FieldValue
  },
}
