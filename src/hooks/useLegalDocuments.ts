import { useQuery } from '@tanstack/react-query'
import { legalDocumentsApi } from '@/api/legal-documents'
import type { DocumentType } from '@/types/database/legal-documents'

export function useLegalDocument(documentType: DocumentType) {
  return useQuery({
    queryKey: ['legal-documents', documentType],
    queryFn: () => legalDocumentsApi.getActiveByType(documentType),
    staleTime: 1000 * 60 * 60, // 1 hour - legal documents don't change often
  })
}

export function useAllLegalDocuments() {
  return useQuery({
    queryKey: ['legal-documents', 'all'],
    queryFn: () => legalDocumentsApi.getAllActive(),
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}
