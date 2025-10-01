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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>7-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto"
            >
              <div className="flex gap-4 pb-2">
                {sevenDays.map((dayForecast, index) => {
                const highTemp = convertTemp(dayForecast.day.temperature)
                const lowTemp = dayForecast.night?.temperature
                  ? convertTemp(dayForecast.night.temperature)
                  : undefined

                return (
                  <button
                    key={dayForecast.day.number}
                    onClick={(e) => handlePeriodClick(dayForecast.day, e.currentTarget)}
                    className="flex min-w-[140px] flex-col items-center gap-2 rounded-lg border p-4 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label={generateAriaLabel(dayForecast, index)}
                  >
                    <div className="text-sm font-semibold">
                      {index === 0 ? 'Today' : getDayName(dayForecast.day.name)}
                    </div>

                    <img
                      src={dayForecast.day.icon}
                      alt=""
                      aria-hidden="true"
                      className="h-16 w-16"
                    />

                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">
                        {dayForecast.day.shortForecast}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{highTemp}{tempUnit}</span>
                      {lowTemp !== undefined && (
                        <span className="text-sm text-muted-foreground">
                          {lowTemp}{tempUnit}
                        </span>
                      )}
                    </div>

                    <div className="w-full space-y-1 text-xs text-muted-foreground">
                      {dayForecast.day.probabilityOfPrecipitation?.value !==
                        null &&
                        dayForecast.day.probabilityOfPrecipitation?.value !==
                          undefined && (
                          <div className="flex items-center justify-center gap-1">
                            <Droplets className="h-3 w-3" aria-hidden="true" />
                            <span>
                              {dayForecast.day.probabilityOfPrecipitation.value}
                              %
                            </span>
                          </div>
                        )}

                      <div className="flex items-center justify-center gap-1">
                        <Wind className="h-3 w-3" aria-hidden="true" />
                        <span className="text-[10px]">
                          {dayForecast.day.windDirection}{' '}
                          {convertWind(dayForecast.day.windSpeed)}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
              </div>
            </div>
            {showScrollIndicator && (
              <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-card to-transparent" />
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