import { useEffect, useState } from 'react'
import { AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useWeatherStore } from '@/stores/weatherStore'

interface ErrorInfo {
  message: string
  details?: unknown
}

export function ErrorBanner() {
  const { error, clearError } = useWeatherStore()
  const [isExpanded, setIsExpanded] = useState(false)
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null)

  useEffect(() => {
    // Reset expansion state whenever error changes
    setIsExpanded(false)

    if (error) {
      // Parse error message
      try {
        const parsed = typeof error === 'string' ? { message: error } : error
        setErrorInfo(parsed)
      } catch {
        setErrorInfo({ message: String(error) })
      }

      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => {
        clearError()
      }, 10000)

      return () => clearTimeout(timer)
    }

    setErrorInfo(null)
    return undefined
  }, [error, clearError])

  if (!errorInfo) {
    return null
  }

  const hasDetails = errorInfo.details !== undefined && errorInfo.details !== null

  const getUserFriendlyMessage = (message: string): string => {
    // Convert technical errors to user-friendly messages
    if (message.includes('Network error')) {
      return 'Unable to connect to the weather service. Please check your internet connection.'
    }
    if (message.includes('404')) {
      return 'Weather data not found for this location. Please verify the ZIP code.'
    }
    if (message.includes('429')) {
      return 'Too many requests. Please wait a moment and try again.'
    }
    if (message.includes('500') || message.includes('502') || message.includes('503')) {
      return 'Weather service is temporarily unavailable. Please try again later.'
    }
    // Default return
    return message
  }

  const severity = errorInfo.message.includes('429') ? 'warning' : 'error'

  return (
    <div className="fixed left-0 right-0 top-16 z-50 px-4 pt-4">
      <Alert
        variant="destructive"
        className={`relative shadow-lg ${severity === 'warning' ? 'border-yellow-500 bg-yellow-50 text-yellow-900 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200' : ''}`}
      >
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="flex items-center justify-between pr-8">
          <span>Weather Service Error</span>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={clearError}
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertTitle>
        <AlertDescription className="mt-2">
          <div className="space-y-2">
            <p>{getUserFriendlyMessage(errorInfo.message)}</p>

            {hasDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 p-0 h-auto text-xs"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    Hide details
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    Show details
                  </>
                )}
              </Button>
            )}

            {isExpanded && hasDetails && (
              <pre className="mt-2 overflow-auto rounded bg-black/10 p-2 text-xs dark:bg-white/10">
                {JSON.stringify(errorInfo.details, null, 2)}
              </pre>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}