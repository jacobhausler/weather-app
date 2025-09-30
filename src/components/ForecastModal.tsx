import { ForecastPeriod } from '@/types/weather'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { Cloud, Droplets, Wind } from 'lucide-react'

interface ForecastModalProps {
  period: ForecastPeriod | null
  open: boolean
  onClose: () => void
}

export function ForecastModal({ period, open, onClose }: ForecastModalProps) {
  if (!period) return null

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEEE, MMM d, h:mm a')
    } catch {
      return dateString
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{period.name}</DialogTitle>
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
              <div className="text-4xl font-bold">
                {period.temperature}°{period.temperatureUnit}
              </div>
              {period.temperatureTrend && (
                <div className="text-sm text-muted-foreground">
                  Trending {period.temperatureTrend}
                </div>
              )}
              <div className="mt-1 text-lg text-muted-foreground">
                {period.shortForecast}
              </div>
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Wind className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Wind</div>
                <div className="font-medium">
                  {period.windDirection} {period.windSpeed}
                </div>
              </div>
            </div>

            {period.probabilityOfPrecipitation?.value !== null &&
              period.probabilityOfPrecipitation?.value !== undefined && (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Droplets className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Precipitation
                    </div>
                    <div className="font-medium">
                      {period.probabilityOfPrecipitation.value}%
                    </div>
                  </div>
                </div>
              )}

            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Cloud className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Day/Night</div>
                <div className="font-medium">
                  {period.isDaytime ? 'Day' : 'Night'}
                </div>
              </div>
            </div>
          </div>

          {/* Time Range */}
          <div className="rounded-lg bg-muted p-4">
            <div className="text-sm">
              <div className="font-medium">Time Period</div>
              <div className="mt-1 text-muted-foreground">
                {formatTime(period.startTime)} - {formatTime(period.endTime)}
              </div>
            </div>
          </div>

          {/* Detailed Forecast */}
          <div>
            <h3 className="mb-2 font-semibold">Detailed Forecast</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {period.detailedForecast}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}