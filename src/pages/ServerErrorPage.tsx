import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Home, 
  RefreshCw, 
  AlertTriangle, 
  MessageSquare,
  HelpCircle,
  ExternalLink,
  Send,
  X
} from "lucide-react"
import { useCreateErrorReport } from "@/hooks/useErrorReports"
import { toast } from "sonner"
import { Link } from "react-router-dom"
import { getLastError } from "@/lib/error-handler"
import { useSearchParams } from "react-router-dom"

// Form validation schema
const errorReportSchema = z.object({
  error_description: z.string().optional(),
  user_comments: z.string()
    .min(10, "Please provide at least 10 characters of detail")
    .max(5000, "Comments must be less than 5000 characters"),
})

type ErrorReportFormData = z.infer<typeof errorReportSchema>

export function ServerErrorPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [lastError, setLastError] = useState<{ message: string; stack?: string; timestamp: string } | null>(null)
  
  const createErrorReport = useCreateErrorReport()

  // Get session ID from URL params, location state, or generate one
  useEffect(() => {
    // Priority: URL params > location state > sessionStorage > generate new
    const urlSessionId = searchParams.get('sessionId')
    const stateSessionId = (location.state as { sessionId?: string })?.sessionId
    
    if (urlSessionId) {
      setSessionId(urlSessionId)
    } else if (stateSessionId) {
      setSessionId(stateSessionId)
    } else {
      // Generate a temporary session ID for tracking
      const tempSessionId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
      setSessionId(tempSessionId)
    }

    // Get last error from sessionStorage if available
    const error = getLastError()
    if (error) {
      setLastError(error)
    }
  }, [searchParams, location.state])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ErrorReportFormData>({
    resolver: zodResolver(errorReportSchema),
  })

  const handleRetry = () => {
    // Try to go back in history, or navigate to home
    if (window.history.length > 1) {
      window.history.back()
    } else {
      navigate("/")
    }
    
    // Show a toast
    toast.info("Retrying previous operation...")
  }

  const onSubmitReport = async (data: ErrorReportFormData) => {
    try {
      // Capture error details from the current page or last error
      const errorDescription = data.error_description || 
        lastError?.message ||
        "Server error encountered. User reported issue via 500 error page."

      await createErrorReport.mutateAsync({
        session_id: sessionId || undefined,
        error_description: errorDescription,
        user_comments: data.user_comments,
        error_type: 'server_error',
        error_code: '500',
        error_stack: lastError?.stack || undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      })

      // Close dialog and reset form
      setIsReportDialogOpen(false)
      reset()
      
      toast.success("Thank you for reporting this issue! Our team will investigate.")
    } catch (error) {
      // Error is already handled by the mutation's onError
      console.error("Failed to submit error report:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-4xl">
        {/* Header with Logo/Home Link */}
        <div className="mb-8 animate-fade-in-down">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground-primary transition-colors"
          >
            <MessageSquare className="h-6 w-6" />
            <span className="text-lg font-semibold">AgentForms</span>
          </Link>
        </div>

        {/* Main Error Card */}
        <Card className="w-full mb-8 animate-fade-in-up shadow-card">
          <CardHeader className="text-center pb-4">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-status-high/10 mb-4 animate-bounce-in">
                <AlertTriangle className="h-12 w-12 text-status-high" />
              </div>
            </div>
            <CardTitle className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-status-high to-status-medium bg-clip-text text-transparent">
              500
            </CardTitle>
            <CardDescription className="text-xl md:text-2xl text-foreground-primary font-semibold mb-2">
              Server Error
            </CardDescription>
            <p className="text-base md:text-lg text-foreground-secondary max-w-2xl mx-auto">
              We're sorry, but something went wrong on our end. Our team has been notified 
              and is working to fix the issue. Please try again in a few moments.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={handleRetry}
                size="lg" 
                className="flex-1 btn-primary"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Retry Operation
              </Button>
              <Button 
                onClick={() => setIsReportDialogOpen(true)}
                variant="outline" 
                size="lg" 
                className="flex-1"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Report Issue
              </Button>
            </div>

            {/* Navigation Links */}
            <div className="pt-6 border-t border-border">
              <p className="text-sm text-foreground-secondary text-center mb-4">
                Need to continue working?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  asChild
                  variant="ghost"
                  className="text-foreground-secondary hover:text-foreground-primary"
                >
                  <Link to="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    Go to Dashboard
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="text-foreground-secondary hover:text-foreground-primary"
                >
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="text-foreground-secondary hover:text-foreground-primary"
                >
                  <Link to="/help">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Visit Help Center
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Helpful Information Card */}
        <Card className="w-full animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle className="text-lg">What happened?</CardTitle>
            <CardDescription>
              A server error means something went wrong on our servers while processing your request.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-foreground-secondary">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-accent-blue text-xs font-semibold">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground-primary mb-1">Try again</p>
                  <p>Click "Retry Operation" to attempt the same action again. The issue may have been temporary.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-green/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-accent-green text-xs font-semibold">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground-primary mb-1">Report the issue</p>
                  <p>If the problem persists, click "Report Issue" to send us details. This helps us fix it faster.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-yellow/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-accent-yellow text-xs font-semibold">3</span>
                </div>
                <div>
                  <p className="font-medium text-foreground-primary mb-1">Continue working</p>
                  <p>Navigate to another page to continue your work while we investigate the issue.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Issue Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Issue</DialogTitle>
            <DialogDescription>
              Help us fix this issue by providing details about what you were doing when the error occurred.
              {sessionId && (
                <span className="block mt-2 text-xs text-foreground-secondary">
                  Session ID: {sessionId}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitReport)} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="error_description">Error Description (Optional)</Label>
              <Input
                id="error_description"
                placeholder="Brief description of what happened..."
                {...register("error_description")}
                disabled={isSubmitting}
              />
              {errors.error_description && (
                <p className="text-sm text-status-high">{errors.error_description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_comments">
                What were you trying to do? <span className="text-status-high">*</span>
              </Label>
              <Textarea
                id="user_comments"
                placeholder="Please describe what you were doing when this error occurred. Include any steps that led to the issue..."
                rows={6}
                {...register("user_comments")}
                disabled={isSubmitting}
                className="resize-none"
              />
              {errors.user_comments && (
                <p className="text-sm text-status-high">{errors.user_comments.message}</p>
              )}
              <p className="text-xs text-foreground-secondary">
                Minimum 10 characters. Be as detailed as possible to help us reproduce the issue.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Report
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsReportDialogOpen(false)
                  reset()
                }}
                disabled={isSubmitting}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
