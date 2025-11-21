/**
 * Error handling utilities for redirecting to error pages
 */

/**
 * Redirect to the 500 Server Error page
 * @param sessionId Optional session ID to track the error
 * @param error Optional error object to log
 */
export function redirectToServerError(sessionId?: string, error?: Error | unknown) {
  // Log error to console for debugging
  if (error) {
    console.error('Server error occurred:', error)
  }

  // Generate session ID if not provided
  const finalSessionId = sessionId || `error_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`

  // Store error details in sessionStorage for the error page to access
  if (error instanceof Error) {
    try {
      sessionStorage.setItem('last_error', JSON.stringify({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }))
    } catch (e) {
      // Ignore sessionStorage errors
    }
  }

  // Redirect to 500 error page
  window.location.href = `/500?sessionId=${finalSessionId}`
}

/**
 * Get the last error from sessionStorage (if available)
 */
export function getLastError(): { message: string; stack?: string; timestamp: string } | null {
  try {
    const errorData = sessionStorage.getItem('last_error')
    if (errorData) {
      const parsed = JSON.parse(errorData)
      sessionStorage.removeItem('last_error') // Clear after reading
      return parsed
    }
  } catch (e) {
    // Ignore parsing errors
  }
  return null
}
