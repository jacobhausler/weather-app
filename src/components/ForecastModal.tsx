import { ForecastPeriod } from '@/types/weather'
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { Cloud, Droplets, Wind, X } from 'lucide-react'
import { useUnitConversion } from '@/hooks/useUnitConversion'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'

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
      <DialogPortal>
        {/* Glass morphism overlay with backdrop blur animation */}
        <DialogOverlay
          className={cn(
            'fixed inset-0 z-50',
            'bg-black/40 backdrop-blur-md',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=open]:backdrop-blur-md data-[state=closed]:backdrop-blur-none',
            'transition-all duration-300'
          )}
        />

        {/* Glass morphism modal content */}
        <DialogPrimitive.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50',
            'w-[95vw] max-w-2xl max-h-[85vh]',
            'translate-x-[-50%] translate-y-[-50%]',
            // Glass morphism effect
            'bg-background/95 backdrop-blur-xl',
            'border border-white/10',
            'shadow-2xl shadow-black/25',
            'rounded-2xl',
            'overflow-hidden',
            // Smooth animations
            'duration-300',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-96 data-[state=open]:zoom-in-100',
            'data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%]',
            // Focus styles
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
          aria-describedby="forecast-description"
        >
          {/* Scrollable content container */}
          <div className="overflow-y-auto max-h-[85vh] scroll-smooth">
            {/* Header section with gradient background */}
            <div className="sticky top-0 z-10 bg-gradient-to-b from-background/98 to-background/95 backdrop-blur-xl border-b border-white/5 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold tracking-tight truncate">
                    {period.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {period.shortForecast}
                  </p>
                </div>

                {/* Elegant close button */}
                <DialogClose
                  className={cn(
                    'rounded-full p-2.5',
                    'bg-muted/50 hover:bg-muted',
                    'border border-white/5 hover:border-white/10',
                    'transition-all duration-200',
                    'hover:scale-110 active:scale-95',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    'group'
                  )}
                >
                  <X className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="sr-only">Close</span>
                </DialogClose>
              </div>
            </div>

            {/* Main content */}
            <div className="px-6 py-6 space-y-6">
              {/* Hero section with weather icon and temperature */}
              <div
                className={cn(
                  'flex items-center gap-6 p-6 rounded-xl',
                  'bg-gradient-to-br from-muted/50 to-muted/30',
                  'border border-white/5',
                  'backdrop-blur-sm',
                  'transition-all duration-300',
                  'hover:border-white/10 hover:shadow-lg'
                )}
              >
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img
                      src={period.icon}
                      alt={period.shortForecast}
                      className="h-28 w-28 drop-shadow-xl"
                    />
                    {/* Subtle glow effect behind icon */}
                    <div className="absolute inset-0 -z-10 blur-2xl opacity-20 bg-gradient-to-br from-blue-400 to-purple-400" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <div className="text-5xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {convertedTemp}
                    </div>
                    <div className="text-3xl font-medium text-muted-foreground">
                      {tempUnit}
                    </div>
                  </div>

                  {period.temperatureTrend && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border border-white/5">
                      <div className="text-xs font-medium text-muted-foreground">
                        Trending {period.temperatureTrend}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Weather details grid with glass cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Wind card */}
                <div
                  className={cn(
                    'group relative overflow-hidden',
                    'flex items-center gap-3 p-4 rounded-xl',
                    'bg-gradient-to-br from-background/60 to-background/40',
                    'border border-white/5',
                    'backdrop-blur-sm',
                    'transition-all duration-300',
                    'hover:border-white/10 hover:shadow-lg hover:scale-[1.02]',
                    'cursor-default'
                  )}
                >
                  {/* Subtle gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 group-hover:bg-muted transition-colors">
                    <Wind className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  </div>

                  <div className="relative flex-1 min-w-0">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Wind
                    </div>
                    <div className="font-semibold text-sm mt-0.5 truncate">
                      {period.windDirection} {convertWind(period.windSpeed)}
                    </div>
                  </div>
                </div>

                {/* Precipitation card */}
                {period.probabilityOfPrecipitation?.value !== null &&
                  period.probabilityOfPrecipitation?.value !== undefined && (
                    <div
                      className={cn(
                        'group relative overflow-hidden',
                        'flex items-center gap-3 p-4 rounded-xl',
                        'bg-gradient-to-br from-background/60 to-background/40',
                        'border border-white/5',
                        'backdrop-blur-sm',
                        'transition-all duration-300',
                        'hover:border-white/10 hover:shadow-lg hover:scale-[1.02]',
                        'cursor-default'
                      )}
                    >
                      {/* Subtle gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 group-hover:bg-muted transition-colors">
                        <Droplets className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
                      </div>

                      <div className="relative flex-1 min-w-0">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Precipitation
                        </div>
                        <div className="font-semibold text-sm mt-0.5">
                          {period.probabilityOfPrecipitation.value}%
                        </div>
                      </div>
                    </div>
                  )}

                {/* Day/Night card */}
                <div
                  className={cn(
                    'group relative overflow-hidden',
                    'flex items-center gap-3 p-4 rounded-xl',
                    'bg-gradient-to-br from-background/60 to-background/40',
                    'border border-white/5',
                    'backdrop-blur-sm',
                    'transition-all duration-300',
                    'hover:border-white/10 hover:shadow-lg hover:scale-[1.02]',
                    'cursor-default'
                  )}
                >
                  {/* Subtle gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 group-hover:bg-muted transition-colors">
                    <Cloud className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                  </div>

                  <div className="relative flex-1 min-w-0">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Period
                    </div>
                    <div className="font-semibold text-sm mt-0.5">
                      {period.isDaytime ? 'Day' : 'Night'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Time range card */}
              <div
                className={cn(
                  'p-5 rounded-xl',
                  'bg-gradient-to-br from-muted/50 to-muted/30',
                  'border border-white/5',
                  'backdrop-blur-sm',
                  'transition-all duration-300',
                  'hover:border-white/10'
                )}
              >
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Time Period
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                    <span className="font-medium">
                      {formatTime(period.startTime)}
                    </span>
                    <span className="hidden sm:inline text-muted-foreground">—</span>
                    <span className="font-medium">
                      {formatTime(period.endTime)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed forecast section */}
              <div
                className={cn(
                  'p-5 rounded-xl space-y-3',
                  'bg-gradient-to-br from-muted/40 to-muted/20',
                  'border border-white/5',
                  'backdrop-blur-sm',
                  'transition-all duration-300',
                  'hover:border-white/10'
                )}
              >
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Detailed Forecast
                </h3>
                <p
                  id="forecast-description"
                  className="text-sm leading-relaxed text-foreground/90"
                >
                  {period.detailedForecast}
                </p>
              </div>

              {/* Bottom spacing for smooth scroll */}
              <div className="h-2" />
            </div>
          </div>

          {/* Gradient fade at bottom for visual polish */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
