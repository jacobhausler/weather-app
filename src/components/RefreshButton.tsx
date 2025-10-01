import { useState } from 'react'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWeatherData } from '@/hooks/useWeatherData'
import { cn } from '@/lib/utils'

export function RefreshButton() {
  const { currentZipCode, isLoading, refreshWeather, isAutoRefreshPaused } = useWeatherData()
  const [isHovered, setIsHovered] = useState(false)

  const handleRefresh = async () => {
    if (!currentZipCode || isLoading) {
      return
    }
    await refreshWeather()
  }

  const disabled = !currentZipCode || isLoading

  return (
    <div className="relative group">
      {/* Glow effect on hover */}
      {!disabled && isHovered && (
        <div
          className={`
            absolute inset-0 rounded-lg blur-md transition-all duration-300
            ${
              isAutoRefreshPaused
                ? 'bg-yellow-500/20 dark:bg-yellow-400/20'
                : 'bg-primary/20'
            }
          `}
        />
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={handleRefresh}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={disabled}
        className={cn(
          'relative h-11 w-11',
          'bg-background/50 backdrop-blur-sm',
          'border border-border/50',
          'hover:bg-background/70 hover:border-border/70',
          'hover:scale-110 active:scale-95',
          'transition-all duration-300 ease-out',
          'shadow-md hover:shadow-lg',
          isAutoRefreshPaused && !disabled && 'text-yellow-600 dark:text-yellow-400 border-yellow-500/50'
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
          <AlertCircle
            className={cn(
              'h-5 w-5 transition-all duration-300',
              isHovered && 'scale-110'
            )}
          />
        ) : (
          <RefreshCw
            className={cn(
              'h-5 w-5 transition-all duration-500',
              isLoading && 'animate-spin',
              disabled && 'opacity-50',
              !isLoading && isHovered && 'rotate-180 scale-110'
            )}
            style={{
              animationDuration: isLoading ? '1s' : '0.5s'
            }}
          />
        )}

        {/* Subtle pulse effect when loading */}
        {isLoading && (
          <span className="absolute inset-0 rounded-lg animate-pulse bg-primary/10" />
        )}
      </Button>

      {/* Decorative gradient ring on active state */}
      {!disabled && (
        <div
          className={cn(
            'absolute inset-0 rounded-lg transition-all duration-300 pointer-events-none',
            isHovered
              ? 'ring-2 ring-primary/20 ring-offset-2 ring-offset-background/0'
              : 'ring-0'
          )}
        />
      )}
    </div>
  )
}
