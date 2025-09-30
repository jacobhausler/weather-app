import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWeatherStore } from '@/stores/weatherStore'
import { apiService } from '@/services/api'
import { cn } from '@/lib/utils'

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { currentZipCode, setWeatherData, setError, isLoading } =
    useWeatherStore()

  const handleRefresh = async () => {
    if (!currentZipCode || isLoading || isRefreshing) {
      return
    }

    setIsRefreshing(true)
    try {
      const data = await apiService.refreshWeather(currentZipCode)
      setWeatherData(data)
    } catch (error: any) {
      setError(error.message || 'Failed to refresh weather data')
    } finally {
      setIsRefreshing(false)
    }
  }

  const disabled = !currentZipCode || isLoading || isRefreshing

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleRefresh}
      disabled={disabled}
      className="relative"
      aria-label="Refresh weather data"
    >
      <RefreshCw
        className={cn(
          'h-5 w-5',
          isRefreshing && 'animate-spin',
          disabled && 'opacity-50'
        )}
      />
    </Button>
  )
}