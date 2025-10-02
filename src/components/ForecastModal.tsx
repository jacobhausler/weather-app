import { ForecastPeriod } from '@/types/weather'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { Cloud, Droplets, Wind } from 'lucide-react'
import { useUnitConversion } from '@/hooks/useUnitConversion'

interface ForecastModalProps {
  period: ForecastPeriod | null
  open: boolean
  onClose: () => void
}

export function ForecastModal({ period, open, onClose }: ForecastModalProps) {
  const { convertTemperature, convertWindSpeed } = useUnitConversion()

  if (!period) return null

  // Helper to convert temperature from F (NWS format) to current unit system
  const convertTemp = (tempF: number) => {
    return convertTemperature(tempF, 'F').value
  }

  // Helper to convert wind speed from mph (NWS format like "10 mph") to current unit system
  const convertWind = (windSpeed?: string) => {
    if (!windSpeed) return 'N/A'
    const match = windSpeed.match(/(\d+)/)
    if (!match || !match[1]) return windSpeed

    const speedMph = parseInt(match[1], 10)
    const converted = convertWindSpeed(speedMph, 'mph')
    return windSpeed.replace(/\d+/, converted.value.toString()).replace('mph', converted.unit)
  }

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEEE, MMM d, h:mm a')
    } catch {
      return dateString
    }
  }

  // Get temperature unit from the conversion function
  const tempUnit = convertTemperature(0, 'F').unit === 'F' ? '°F' : '°C'
  const convertedTemp = convertTemp(period.temperature)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white/20 dark:bg-black/30 backdrop-blur-2xl border border-white/30 dark:border-white/15 shadow-glass-lg"
        aria-describedby="forecast-description"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl text-white dark:text-gray-100">{period.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Weather Icon and Temperature */}
          <div className="flex items-center gap-6">
            <img
              src={period.icon}
              alt={period.shortForecast}
              className="h-24 w-24"
            />
            <div>
              <div className="text-4xl font-bold text-white dark:text-gray-100">
                {convertedTemp}{tempUnit}
              </div>
              {period.temperatureTrend && (
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  Trending {period.temperatureTrend}
                </div>
              )}
              <div className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                {period.shortForecast}
              </div>
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Wind className="h-5 w-5 text-gray-900 dark:text-gray-100" />
              <div>
                <div className="text-xs text-gray-900 dark:text-gray-100">Wind</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {period.windDirection} {convertWind(period.windSpeed)}
                </div>
              </div>
            </div>

            {period.probabilityOfPrecipitation?.value !== null &&
              period.probabilityOfPrecipitation?.value !== undefined && (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Droplets className="h-5 w-5 text-gray-900 dark:text-gray-100" />
                  <div>
                    <div className="text-xs text-gray-900 dark:text-gray-100">
                      Precipitation
                    </div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {period.probabilityOfPrecipitation.value}%
                    </div>
                  </div>
                </div>
              )}

            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Cloud className="h-5 w-5 text-gray-900 dark:text-gray-100" />
              <div>
                <div className="text-xs text-gray-900 dark:text-gray-100">Day/Night</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {period.isDaytime ? 'Day' : 'Night'}
                </div>
              </div>
            </div>
          </div>

          {/* Time Range */}
          <div className="rounded-lg bg-muted p-4">
            <div className="text-sm">
              <div className="font-medium text-gray-900 dark:text-gray-100">Time Period</div>
              <div className="mt-1 text-gray-900 dark:text-gray-100">
                {formatTime(period.startTime)} - {formatTime(period.endTime)}
              </div>
            </div>
          </div>

          {/* Detailed Forecast */}
          <div>
            <h3 className="mb-2 font-semibold text-white dark:text-gray-100">Detailed Forecast</h3>
            <p id="forecast-description" className="text-sm leading-relaxed text-gray-900 dark:text-gray-100">
              {period.detailedForecast}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}