import { supabase } from '@/lib/supabase'
import type { LegalDocument, DocumentType } from '@/types/database/legal-documents'

export const legalDocumentsApi = {
  /**
   * Get active legal document by type
   * Publicly accessible
   */
  async getActiveByType(documentType: DocumentType): Promise<LegalDocument | null> {
    const { data, error } = await supabase
      .from('legal_documents')
      .select('*')
      .eq('document_type', documentType)
      .eq('is_active', true)
      .order('version_number', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get legal document: ${error.message}`)
    }

    return data as LegalDocument
  },

  /**
   * Get all active legal documents
   * Publicly accessible
   */
  async getAllActive(): Promise<LegalDocument[]> {
    const { data, error } = await supabase
      .from('legal_documents')
      .select('*')
      .eq('is_active', true)
      .order('document_type', { ascending: true })
      .order('version_number', { ascending: false })

    if (error) {
      throw new Error(`Failed to get legal documents: ${error.message}`)
    }

    return (data || []) as LegalDocument[]
  },
}
