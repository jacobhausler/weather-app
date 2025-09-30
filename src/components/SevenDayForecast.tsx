import { useState } from 'react'
import { ForecastPeriod } from '@/types/weather'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ForecastModal } from './ForecastModal'
import { Droplets, Wind } from 'lucide-react'

interface SevenDayForecastProps {
  forecast: ForecastPeriod[]
}

interface DayForecast {
  day: ForecastPeriod
  night?: ForecastPeriod
}

export function SevenDayForecast({ forecast }: SevenDayForecastProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<ForecastPeriod | null>(
    null
  )
  const [modalOpen, setModalOpen] = useState(false)

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
                const highTemp = dayForecast.day.temperature
                const lowTemp = dayForecast.night?.temperature

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
                      <span className="text-lg font-bold">{highTemp}°</span>
                      {lowTemp !== undefined && (
                        <span className="text-sm text-muted-foreground">
                          {lowTemp}°
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
                          {dayForecast.day.windSpeed}
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