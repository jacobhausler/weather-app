import { useState, useCallback } from 'react'
import { ForecastPeriod } from '@/types/weather'
import { GlassCard, CardContent, CardHeader, CardTitle } from '@/components/ui/glass-card'
import { ForecastModal } from './ForecastModal'
import { Droplets, Wind } from 'lucide-react'
import { useUnitStore, convertTempFromF, convertSpeedFromMph, getTempUnit, getSpeedUnit } from '@/stores/unitStore'
import { WeatherIcon } from './WeatherIcon'

interface SevenDayForecastProps {
  forecast: ForecastPeriod[]
}

interface DayForecast {
  day: ForecastPeriod
  night?: ForecastPeriod
}

export function SevenDayForecast({ forecast }: SevenDayForecastProps) {
  const { unitSystem } = useUnitStore()
  const [selectedPeriod, setSelectedPeriod] = useState<ForecastPeriod | null>(
    null
  )
  const [modalOpen, setModalOpen] = useState(false)
  const [triggerButton, setTriggerButton] = useState<HTMLButtonElement | null>(null)

  // Helper to convert temperature from F (NWS format) to current unit system
  const convertTemp = (tempF: number) => {
    return Math.round(convertTempFromF(tempF, unitSystem))
  }

  // Helper to convert wind speed from mph (NWS format like "10 mph") to current unit system
  const convertWind = (windSpeed?: string) => {
    if (!windSpeed) return 'N/A'
    const match = windSpeed.match(/(\d+)/)
    if (!match || !match[1]) return windSpeed

    const speedMph = parseInt(match[1], 10)
    const converted = Math.round(convertSpeedFromMph(speedMph, unitSystem))
    const unit = getSpeedUnit(unitSystem)
    return windSpeed.replace(/\d+/, converted.toString()).replace('mph', unit)
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

  // Get temperature unit from the unit store
  const tempUnit = getTempUnit(unitSystem)

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
      <GlassCard blur="lg" gradient interactive className="shadow-glass border border-white/30 dark:border-white/15">
        <CardHeader>
          <CardTitle className="text-white dark:text-gray-100">7-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {sevenDays.map((dayForecast, index) => {
              const highTemp = convertTemp(dayForecast.day.temperature)
              const lowTemp = dayForecast.night?.temperature
                ? convertTemp(dayForecast.night.temperature)
                : undefined

              return (
                <button
                  key={dayForecast.day.number}
                  onClick={(e) => handlePeriodClick(dayForecast.day, e.currentTarget)}
                  className="flex w-full flex-row items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={generateAriaLabel(dayForecast, index)}
                >
                  <WeatherIcon
                    nwsIconUrl={dayForecast.day.icon}
                    shortForecast={dayForecast.day.shortForecast}
                    size="md"
                    className="h-16 w-16 shrink-0"
                  />

                  <div className="flex flex-col items-start gap-1 w-full">
                    <div className="text-sm font-semibold">
                      {index === 0 ? 'Today' : getDayName(dayForecast.day.name)}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {dayForecast.day.shortForecast}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{highTemp}{tempUnit}</span>
                      {lowTemp !== undefined && (
                        <span className="text-sm text-muted-foreground">
                          / {lowTemp}{tempUnit}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-3 text-xs text-muted-foreground">
                      {dayForecast.day.probabilityOfPrecipitation?.value !== null &&
                        dayForecast.day.probabilityOfPrecipitation?.value !== undefined && (
                          <div className="flex items-center gap-1">
                            <Droplets className="h-3 w-3" aria-hidden="true" />
                            <span>{dayForecast.day.probabilityOfPrecipitation.value}%</span>
                          </div>
                        )}

                      <div className="flex items-center gap-1">
                        <Wind className="h-3 w-3" aria-hidden="true" />
                        <span className="text-[10px]">
                          {dayForecast.day.windDirection}{' '}
                          {convertWind(dayForecast.day.windSpeed)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </GlassCard>

      <ForecastModal
        period={selectedPeriod}
        open={modalOpen}
        onClose={handleModalClose}
      />
    </>
  )
}