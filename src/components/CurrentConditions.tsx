import { Observation, ForecastPeriod, UVIndex, SunTimes } from '@/types/weather'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Cloud,
  Sun,
  Sunrise,
  Sunset,
} from 'lucide-react'
import { useUnitStore, convertTemp, convertSpeed, convertDistance, getTempUnit, getSpeedUnit, getDistanceUnit } from '@/stores/unitStore'

interface CurrentConditionsProps {
  observation?: Observation
  todayForecast?: ForecastPeriod
  tonightForecast?: ForecastPeriod
  uvIndex?: UVIndex | null
  sunTimes?: SunTimes
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

const getUVIndexLabel = (value: number): string => {
  if (value <= 2) return 'Low'
  if (value <= 5) return 'Moderate'
  if (value <= 7) return 'High'
  if (value <= 10) return 'Very High'
  return 'Extreme'
}

const getUVIndexColor = (value: number): string => {
  if (value <= 2) return 'text-green-600 dark:text-green-400'
  if (value <= 5) return 'text-yellow-600 dark:text-yellow-400'
  if (value <= 7) return 'text-orange-600 dark:text-orange-400'
  if (value <= 10) return 'text-red-600 dark:text-red-400'
  return 'text-purple-600 dark:text-purple-400'
}

export function CurrentConditions({
  observation,
  todayForecast,
  tonightForecast,
  uvIndex,
  sunTimes,
}: CurrentConditionsProps) {
  const { unitSystem } = useUnitStore()

  if (!observation && !todayForecast) {
    return null
  }

  // Format sunrise/sunset times
  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Temperature conversions
  const currentTemp = observation?.temperature.value
    ? Math.round(convertTemp(observation.temperature.value, unitSystem))
    : todayForecast?.temperature

  const dewpoint = observation?.dewpoint.value
    ? Math.round(convertTemp(observation.dewpoint.value, unitSystem))
    : null

  const humidity = observation?.relativeHumidity.value

  // Wind speed conversions (NWS provides m/s)
  const windSpeed = observation?.windSpeed.value
    ? Math.round(convertSpeed(observation.windSpeed.value, unitSystem))
    : null

  const windGust = observation?.windGust.value
    ? Math.round(convertSpeed(observation.windGust.value, unitSystem))
    : null

  const windDir = observation?.windDirection.value
    ? getWindDirection(observation.windDirection.value)
    : null

  // Visibility conversion
  const visibility = observation?.visibility.value
    ? convertDistance(observation.visibility.value, unitSystem).toFixed(1)
    : null

  const heatIndex = observation?.heatIndex.value
    ? Math.round(convertTemp(observation.heatIndex.value, unitSystem))
    : null

  const windChill = observation?.windChill.value
    ? Math.round(convertTemp(observation.windChill.value, unitSystem))
    : null

  const feelsLike = currentTemp
    ? getFeelsLike(currentTemp, heatIndex, windChill)
    : null

  const cloudCover = observation?.cloudLayers?.[0]?.amount || 'N/A'

  // Get unit labels
  const tempUnit = getTempUnit(unitSystem)
  const speedUnit = getSpeedUnit(unitSystem)
  const distanceUnit = getDistanceUnit(unitSystem)

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
                    ? `${currentTemp}${tempUnit}`
                    : 'N/A'}
                </div>
                {feelsLike !== null &&
                  feelsLike !== undefined &&
                  feelsLike !== currentTemp && (
                    <div className="text-sm text-muted-foreground">
                      Feels like {feelsLike}{tempUnit}
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
                    {todayForecast.temperature}{tempUnit}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Low: </span>
                  <span className="font-semibold">
                    {tonightForecast.temperature}{tempUnit}
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
              value={dewpoint !== null ? `${dewpoint}${tempUnit}` : 'N/A'}
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
                  ? `${windDir || 'N/A'} ${windSpeed} ${speedUnit}`
                  : 'N/A'
              }
            />

            {windGust !== null && windGust > 0 && (
              <WeatherDetailItem
                icon={<Wind className="h-4 w-4" />}
                label="Gusts"
                value={`${windGust} ${speedUnit}`}
              />
            )}

            <WeatherDetailItem
              icon={<Eye className="h-4 w-4" />}
              label="Visibility"
              value={visibility ? `${visibility} ${distanceUnit}` : 'N/A'}
            />

            <WeatherDetailItem
              icon={<Cloud className="h-4 w-4" />}
              label="Cloud Cover"
              value={cloudCover}
            />

            {uvIndex && uvIndex.value !== null && uvIndex.value !== undefined && (
              <UVIndexItem value={uvIndex.value} />
            )}

            {sunTimes && (
              <>
                <WeatherDetailItem
                  icon={<Sunrise className="h-4 w-4" />}
                  label="Sunrise"
                  value={formatTime(sunTimes.sunrise)}
                />

                <WeatherDetailItem
                  icon={<Sunset className="h-4 w-4" />}
                  label="Sunset"
                  value={formatTime(sunTimes.sunset)}
                />
              </>
            )}
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
                  {tonightForecast.temperature}{tempUnit}
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

interface UVIndexItemProps {
  value: number
}

function UVIndexItem({ value }: UVIndexItemProps) {
  const label = getUVIndexLabel(value)
  const colorClass = getUVIndexColor(value)

  return (
    <div className="flex items-center gap-2 rounded-lg border p-3">
      <div className="text-muted-foreground">
        <Sun className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted-foreground">UV Index</div>
        <div className={`truncate text-sm font-medium ${colorClass}`}>
          {value.toFixed(1)} ({label})
        </div>
      </div>
    </div>
  )
}