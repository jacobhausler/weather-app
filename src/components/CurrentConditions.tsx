import { Observation, ForecastPeriod } from '@/types/weather'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Cloud,
} from 'lucide-react'

interface CurrentConditionsProps {
  observation?: Observation
  todayForecast?: ForecastPeriod
  tonightForecast?: ForecastPeriod
}

const convertCelsiusToFahrenheit = (celsius: number) => {
  return Math.round((celsius * 9) / 5 + 32)
}

const convertMetersToMiles = (meters: number) => {
  return (meters * 0.000621371).toFixed(1)
}

const getWindDirection = (degrees: number | null) => {
  if (degrees === null) return 'N/A'
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

const getFeelsLike = (temp: number, heatIndex: number | null, windChill: number | null) => {
  if (heatIndex !== null && heatIndex > temp) return heatIndex
  if (windChill !== null && windChill < temp) return windChill
  return temp
}

export function CurrentConditions({
  observation,
  todayForecast,
  tonightForecast,
}: CurrentConditionsProps) {
  if (!observation && !todayForecast) {
    return null
  }

  const currentTemp = observation?.temperature.value
    ? convertCelsiusToFahrenheit(observation.temperature.value)
    : todayForecast?.temperature

  const dewpoint = observation?.dewpoint.value
    ? convertCelsiusToFahrenheit(observation.dewpoint.value)
    : null

  const humidity = observation?.relativeHumidity.value

  const windSpeed = observation?.windSpeed.value
    ? Math.round(observation.windSpeed.value * 2.237) // m/s to mph
    : null

  const windGust = observation?.windGust.value
    ? Math.round(observation.windGust.value * 2.237)
    : null

  const windDir = observation?.windDirection.value
    ? getWindDirection(observation.windDirection.value)
    : null

  const visibility = observation?.visibility.value
    ? convertMetersToMiles(observation.visibility.value)
    : null

  const heatIndex = observation?.heatIndex.value
    ? convertCelsiusToFahrenheit(observation.heatIndex.value)
    : null

  const windChill = observation?.windChill.value
    ? convertCelsiusToFahrenheit(observation.windChill.value)
    : null

  const feelsLike = currentTemp
    ? getFeelsLike(currentTemp, heatIndex, windChill)
    : null

  const cloudCover = observation?.cloudLayers?.[0]?.amount || 'N/A'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Conditions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Weather */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {todayForecast && (
                <img
                  src={todayForecast.icon}
                  alt={todayForecast.shortForecast}
                  className="h-20 w-20"
                />
              )}
              <div>
                <div className="text-5xl font-bold">
                  {currentTemp !== null && currentTemp !== undefined
                    ? `${currentTemp}°F`
                    : 'N/A'}
                </div>
                {feelsLike !== null &&
                  feelsLike !== undefined &&
                  feelsLike !== currentTemp && (
                    <div className="text-sm text-muted-foreground">
                      Feels like {feelsLike}°F
                    </div>
                  )}
              </div>
            </div>

            {todayForecast && (
              <div className="text-sm text-muted-foreground">
                {todayForecast.shortForecast}
              </div>
            )}

            {/* Today's High/Low */}
            {todayForecast && tonightForecast && (
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">High: </span>
                  <span className="font-semibold">
                    {todayForecast.temperature}°
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Low: </span>
                  <span className="font-semibold">
                    {tonightForecast.temperature}°
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <WeatherDetailItem
              icon={<Thermometer className="h-4 w-4" />}
              label="Dewpoint"
              value={dewpoint !== null ? `${dewpoint}°F` : 'N/A'}
            />

            <WeatherDetailItem
              icon={<Droplets className="h-4 w-4" />}
              label="Humidity"
              value={humidity !== null ? `${humidity}%` : 'N/A'}
            />

            <WeatherDetailItem
              icon={<Wind className="h-4 w-4" />}
              label="Wind"
              value={
                windSpeed !== null
                  ? `${windDir || 'N/A'} ${windSpeed} mph`
                  : 'N/A'
              }
            />

            {windGust !== null && windGust > 0 && (
              <WeatherDetailItem
                icon={<Wind className="h-4 w-4" />}
                label="Gusts"
                value={`${windGust} mph`}
              />
            )}

            <WeatherDetailItem
              icon={<Eye className="h-4 w-4" />}
              label="Visibility"
              value={visibility ? `${visibility} mi` : 'N/A'}
            />

            <WeatherDetailItem
              icon={<Cloud className="h-4 w-4" />}
              label="Cloud Cover"
              value={cloudCover}
            />
          </div>
        </div>

        {/* Detailed Forecast */}
        {todayForecast?.detailedForecast && (
          <div className="mt-6 rounded-lg bg-muted p-4">
            <h3 className="mb-2 font-semibold">Forecast</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {todayForecast.detailedForecast}
            </p>
          </div>
        )}

        {/* Tonight's Forecast */}
        {tonightForecast && (
          <div className="mt-4 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <img
                src={tonightForecast.icon}
                alt={tonightForecast.shortForecast}
                className="h-12 w-12"
              />
              <div>
                <div className="font-semibold">{tonightForecast.name}</div>
                <div className="text-sm text-muted-foreground">
                  {tonightForecast.shortForecast} -{' '}
                  {tonightForecast.temperature}°F
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface WeatherDetailItemProps {
  icon: React.ReactNode
  label: string
  value: string
}

function WeatherDetailItem({ icon, label, value }: WeatherDetailItemProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border p-3">
      <div className="text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-medium">{value}</div>
      </div>
    </div>
  )
}