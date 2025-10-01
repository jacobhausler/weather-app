import { useState, useRef, useEffect, useCallback } from 'react'
import { ForecastPeriod } from '@/types/weather'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ForecastModal } from './ForecastModal'
import { Droplets, Wind } from 'lucide-react'
import { useUnitConversion } from '@/hooks/useUnitConversion'

interface SevenDayForecastProps {
  forecast: ForecastPeriod[]
}

interface DayForecast {
  day: ForecastPeriod
  night?: ForecastPeriod
}

export function SevenDayForecast({ forecast }: SevenDayForecastProps) {
  const { convertTemperature, convertWindSpeed } = useUnitConversion()
  const [selectedPeriod, setSelectedPeriod] = useState<ForecastPeriod | null>(
    null
  )
  const [modalOpen, setModalOpen] = useState(false)
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [triggerButton, setTriggerButton] = useState<HTMLButtonElement | null>(null)

  // Check if content is scrollable and update indicator visibility
  useEffect(() => {
    const checkScrollable = () => {
      const container = scrollContainerRef.current
      if (container) {
        const isScrollable = container.scrollWidth > container.clientWidth
        const isScrolledToEnd =
          container.scrollWidth - container.scrollLeft <= container.clientWidth + 10
        setShowScrollIndicator(isScrollable && !isScrolledToEnd)
      }
    }

    checkScrollable()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollable)
      window.addEventListener('resize', checkScrollable)
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollable)
      }
      window.removeEventListener('resize', checkScrollable)
    }
  }, [forecast])

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

  // Combine day and night forecasts
  const groupedForecast: DayForecast[] = []
  for (let i = 0; i < forecast.length; i++) {
    const period = forecast[i]
    if (period && period.isDaytime) {
      const nextPeriod = forecast[i + 1]
      groupedForecast.push({
        day: period,
        night: nextPeriod && !nextPeriod.isDaytime ? nextPeriod : undefined,
      })
      if (nextPeriod && !nextPeriod.isDaytime) {
        i++ // Skip the night period since we already added it
      }
    }
  }

  // Limit to 7 days
  const sevenDays = groupedForecast.slice(0, 7)

  const handlePeriodClick = useCallback((period: ForecastPeriod, buttonRef?: HTMLButtonElement) => {
    if (buttonRef) {
      setTriggerButton(buttonRef)
    }
    setSelectedPeriod(period)
    setModalOpen(true)
  }, [])

  const handleModalClose = useCallback(() => {
    setModalOpen(false)
    // Return focus to the trigger button after modal closes
    setTimeout(() => {
      triggerButton?.focus()
    }, 0)
  }, [triggerButton])

  const getDayName = (name: string) => {
    // Extract day name from names like "Monday" or "Monday Night"
    return name.replace(' Night', '').replace(' Afternoon', '')
  }

  // Get temperature unit from the conversion function
  const tempUnit = convertTemperature(0, 'F').unit === 'F' ? '°F' : '°C'

  // Generate comprehensive aria-label for screen readers
  const generateAriaLabel = (dayForecast: DayForecast, index: number) => {
    const dayName = index === 0 ? 'Today' : getDayName(dayForecast.day.name)
    const highTemp = convertTemp(dayForecast.day.temperature)
    const lowTemp = dayForecast.night?.temperature
      ? convertTemp(dayForecast.night.temperature)
      : null

    const tempDescription = lowTemp !== null
      ? `High ${highTemp}${tempUnit}, Low ${lowTemp}${tempUnit}`
      : `${highTemp}${tempUnit}`

    const weatherDescription = dayForecast.day.shortForecast

    const precipProb = dayForecast.day.probabilityOfPrecipitation?.value
    const precipDescription = precipProb !== null && precipProb !== undefined
      ? `${precipProb}% chance of precipitation`
      : null

    const windDescription = `Wind ${dayForecast.day.windDirection} at ${convertWind(dayForecast.day.windSpeed)}`

    const parts = [
      `${dayName}:`,
      tempDescription,
      weatherDescription,
      precipDescription,
      windDescription,
      'Click to view detailed forecast.'
    ].filter(Boolean)

    return parts.join('. ')
  }

  // Get temperature gradient color based on temp value
  const getTempGradient = (temp: number) => {
    if (temp >= 90) return 'from-red-500 to-orange-500'
    if (temp >= 80) return 'from-orange-500 to-amber-500'
    if (temp >= 70) return 'from-amber-500 to-yellow-500'
    if (temp >= 60) return 'from-yellow-500 to-lime-500'
    if (temp >= 50) return 'from-lime-500 to-green-500'
    if (temp >= 40) return 'from-green-500 to-cyan-500'
    if (temp >= 32) return 'from-cyan-500 to-blue-500'
    return 'from-blue-500 to-indigo-500'
  }

  return (
    <>
      <Card className="group overflow-hidden border-[0.5px] border-border/50 bg-gradient-to-br from-card/95 via-card/90 to-card/95 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <CardHeader className="relative space-y-0 pb-3">
          <CardTitle className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text text-transparent">
            7-Day Forecast
          </CardTitle>
        </CardHeader>

        <CardContent className="relative">
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40"
              style={{
                scrollbarWidth: 'thin',
                scrollBehavior: 'smooth'
              }}
            >
              <div className="flex gap-3 pb-2">
                {sevenDays.map((dayForecast, index) => {
                  const highTemp = convertTemp(dayForecast.day.temperature)
                  const lowTemp = dayForecast.night?.temperature
                    ? convertTemp(dayForecast.night.temperature)
                    : undefined

                  return (
                    <button
                      key={dayForecast.day.number}
                      onClick={(e) => handlePeriodClick(dayForecast.day, e.currentTarget)}
                      className="group/day relative flex min-w-[150px] flex-col items-center gap-3 overflow-hidden rounded-2xl border-[0.5px] border-border/50 bg-gradient-to-br from-card/80 via-card/60 to-card/80 p-5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-border/70 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label={generateAriaLabel(dayForecast, index)}
                    >
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-accent/0 to-primary/0 opacity-0 transition-all duration-500 group-hover/day:from-primary/10 group-hover/day:via-accent/5 group-hover/day:to-primary/10 group-hover/day:opacity-100" />

                      {/* Content */}
                      <div className="relative z-10 w-full space-y-3">
                        {/* Day Name */}
                        <div className="text-sm font-bold uppercase tracking-wider text-foreground/90">
                          {index === 0 ? 'Today' : getDayName(dayForecast.day.name)}
                        </div>

                        {/* Weather Icon */}
                        <div className="relative mx-auto">
                          <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 blur-xl transition-all duration-500 group-hover/day:opacity-100" />
                          <img
                            src={dayForecast.day.icon}
                            alt=""
                            aria-hidden="true"
                            className="relative h-20 w-20 transform transition-all duration-500 group-hover/day:scale-110 group-hover/day:drop-shadow-lg"
                          />
                        </div>

                        {/* Weather Description */}
                        <div className="min-h-[32px] text-center text-xs leading-tight text-muted-foreground/80">
                          {dayForecast.day.shortForecast}
                        </div>

                        {/* Temperature Display */}
                        <div className="flex items-baseline justify-center gap-2.5">
                          <span className={`bg-gradient-to-r ${getTempGradient(highTemp)} bg-clip-text text-2xl font-black tabular-nums text-transparent drop-shadow-sm`}>
                            {highTemp}{tempUnit}
                          </span>
                          {lowTemp !== undefined && (
                            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-base font-semibold tabular-nums text-transparent dark:from-blue-400 dark:to-cyan-400">
                              {lowTemp}{tempUnit}
                            </span>
                          )}
                        </div>

                        {/* Weather Metrics */}
                        <div className="space-y-2 border-t border-border/30 pt-3">
                          {dayForecast.day.probabilityOfPrecipitation?.value !== null &&
                            dayForecast.day.probabilityOfPrecipitation?.value !== undefined && (
                              <div className="flex items-center justify-center gap-2 rounded-lg bg-blue-500/10 px-3 py-1.5 backdrop-blur-sm">
                                <Droplets className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                                  {dayForecast.day.probabilityOfPrecipitation.value}%
                                </span>
                              </div>
                            )}

                          <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1.5 backdrop-blur-sm">
                            <Wind className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                            <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                              {dayForecast.day.windDirection} {convertWind(dayForecast.day.windSpeed)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Hover indicator */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-0 transition-opacity duration-300 group-hover/day:opacity-100" />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Scroll indicator with gradient */}
            {showScrollIndicator && (
              <div className="pointer-events-none absolute right-0 top-0 flex h-full w-20 items-center justify-end">
                <div className="h-full w-full bg-gradient-to-l from-card via-card/50 to-transparent" />
                <div className="absolute right-4 animate-pulse text-muted-foreground/50">
                  →
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ForecastModal
        period={selectedPeriod}
        open={modalOpen}
        onClose={handleModalClose}
      />
    </>
  )
}
