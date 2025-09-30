import { RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWeatherData } from '@/hooks/useWeatherData'
import { cn } from '@/lib/utils'

export function RefreshButton() {
  const { currentZipCode, isLoading, refreshWeather, isAutoRefreshPaused } = useWeatherData()

  const handleRefresh = async () => {
    if (!currentZipCode || isLoading) {
      return
    }
    await refreshWeather()
  }

  const disabled = !currentZipCode || isLoading

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleRefresh}
      disabled={disabled}
      className={cn(
        'relative',
        isAutoRefreshPaused && !disabled && 'text-yellow-600 dark:text-yellow-400'
      )}
      title={
        isAutoRefreshPaused
          ? 'Auto-refresh paused due to errors. Click to retry.'
          : 'Refresh weather data'
      }
      aria-label={
        isAutoRefreshPaused
          ? 'Auto-refresh paused - Click to retry'
          : 'Refresh weather data'
      }
    >
      {isAutoRefreshPaused && !disabled ? (
        <AlertCircle className="h-5 w-5" />
      ) : (
        <RefreshCw
          className={cn(
            'h-5 w-5',
            isLoading && 'animate-spin',
            disabled && 'opacity-50'
          )}
        />
      )}
    </Button>
  )
}