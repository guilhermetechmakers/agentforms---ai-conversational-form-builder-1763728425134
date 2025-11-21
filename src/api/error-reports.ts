import { supabase } from '@/lib/supabase'
import type { ErrorReport, ErrorReportInsert, ErrorReportUpdate } from '@/types/database/error-reports'

export const errorReportsApi = {
  /**
   * Create a new error report
   */
  async create(report: ErrorReportInsert): Promise<ErrorReport> {
    // Try to get current user, but allow anonymous reports
    const { data: { user } } = await supabase.auth.getUser()
    
    const reportData: ErrorReportInsert = {
      ...report,
      user_id: user?.id || null,
      // Capture browser metadata if available
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : report.user_agent || null,
      url: typeof window !== 'undefined' ? window.location.href : report.url || null,
      referrer: typeof document !== 'undefined' ? document.referrer : report.referrer || null,
    }

    const { data, error } = await supabase
      .from('error_reports')
      .insert(reportData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create error report: ${error.message}`)
    }

    return data as ErrorReport
  },

  /**
   * Get user's error reports
   */
  async getMyReports(): Promise<ErrorReport[]> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User must be authenticated to get error reports')
    }

    const { data, error } = await supabase
      .from('error_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get error reports: ${error.message}`)
    }

    return (data || []) as ErrorReport[]
  },

  /**
   * Get error report by ID
   */
  async getById(id: string): Promise<ErrorReport | null> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User must be authenticated to get error report')
    }

    const { data, error } = await supabase
      .from('error_reports')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get error report: ${error.message}`)
    }

    return data as ErrorReport
  },

  /**
   * Update error report
   */
  async update(id: string, updates: ErrorReportUpdate): Promise<ErrorReport> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User must be authenticated to update error report')
    }

    const { data, error } = await supabase
      .from('error_reports')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update error report: ${error.message}`)
    }

    return data as ErrorReport
  },
}
