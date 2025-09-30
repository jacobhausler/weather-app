import { useState } from 'react'
import { ForecastPeriod } from '@/types/weather'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ForecastModal } from './ForecastModal'
import { Droplets, Wind } from 'lucide-react'
import { useUnitStore, getTempUnit } from '@/stores/unitStore'

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

  // Convert temperature from Fahrenheit (NWS default) to current unit system
  const convertTemperature = (tempF: number) => {
    if (unitSystem === 'metric') {
      return Math.round(((tempF - 32) * 5) / 9)
    }
    return tempF
  }

  // Convert wind speed from mph (NWS format like "10 mph") to current unit system
  const convertWindSpeed = (windSpeed?: string) => {
    if (!windSpeed) return 'N/A'
    const match = windSpeed.match(/(\d+)/)
    if (!match || !match[1]) return windSpeed

    const speedMph = parseInt(match[1], 10)
    if (unitSystem === 'metric') {
      const speedKmh = Math.round(speedMph * 1.60934)
      return windSpeed.replace(/\d+/, speedKmh.toString()).replace('mph', 'km/h')
    }
    return windSpeed
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

  const handlePeriodClick = (period: ForecastPeriod) => {
    setSelectedPeriod(period)
    setModalOpen(true)
  }

  const getDayName = (name: string) => {
    // Extract day name from names like "Monday" or "Monday Night"
    return name.replace(' Night', '').replace(' Afternoon', '')
  }

  const tempUnit = getTempUnit(unitSystem)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>7-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-2">
              {sevenDays.map((dayForecast, index) => {
                const highTemp = convertTemperature(dayForecast.day.temperature)
                const lowTemp = dayForecast.night?.temperature
                  ? convertTemperature(dayForecast.night.temperature)
                  : undefined

                return (
                  <button
                    key={dayForecast.day.number}
                    onClick={() => handlePeriodClick(dayForecast.day)}
                    className="flex min-w-[140px] flex-col items-center gap-2 rounded-lg border p-4 transition-colors hover:bg-muted"
                  >
                    <div className="text-sm font-semibold">
                      {index === 0 ? 'Today' : getDayName(dayForecast.day.name)}
                    </div>

                    <img
                      src={dayForecast.day.icon}
                      alt={dayForecast.day.shortForecast}
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
                            <Droplets className="h-3 w-3" />
                            <span>
                              {dayForecast.day.probabilityOfPrecipitation.value}
                              %
                            </span>
                          </div>
                        )}

                      <div className="flex items-center justify-center gap-1">
                        <Wind className="h-3 w-3" />
                        <span className="text-[10px]">
                          {dayForecast.day.windDirection}{' '}
                          {convertWindSpeed(dayForecast.day.windSpeed)}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <ForecastModal
        period={selectedPeriod}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}