import { Observation, ForecastPeriod, SunTimes } from '@/types/weather'
import { GlassCard, CardContent, CardHeader, CardTitle } from '@/components/ui/glass-card'
import {
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Cloud,
  Sunrise,
  Sunset,
} from 'lucide-react'
import { useUnitStore, convertTemp, convertSpeed, convertDistance, getTempUnit, getSpeedUnit, getDistanceUnit } from '@/stores/unitStore'
import { WeatherIcon } from './WeatherIcon'

interface CurrentConditionsProps {
  observation?: Observation
  todayForecast?: ForecastPeriod
  tonightForecast?: ForecastPeriod
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

export function CurrentConditions({
  observation,
  todayForecast,
  tonightForecast,
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

  const humidity = observation?.relativeHumidity.value !== null && observation?.relativeHumidity.value !== undefined
    ? Math.round(observation.relativeHumidity.value)
    : null

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
    <GlassCard blur="lg" gradient interactive className="shadow-glass border border-white/30 dark:border-white/15">
      <CardHeader>
        <CardTitle className="text-white dark:text-gray-100">Current Conditions</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Detailed Forecast */}
        {todayForecast?.detailedForecast && (
          <div className="mb-4 rounded-lg bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 p-3">
            <h3 className="mb-1 text-sm font-semibold text-white dark:text-gray-100">Forecast</h3>
            <p className="text-xs leading-relaxed text-gray-100 dark:text-gray-200">
              {todayForecast.detailedForecast}
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {/* Current Weather */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {todayForecast && (
                <WeatherIcon
                  nwsIconUrl={todayForecast.icon}
                  shortForecast={todayForecast.shortForecast}
                  size="md"
                  className="h-16 w-16"
                />
              )}
              <div>
                <div className="text-4xl font-bold">
                  {currentTemp !== null && currentTemp !== undefined
                    ? `${currentTemp}${tempUnit}`
                    : 'N/A'}
                </div>
                {feelsLike !== null &&
                  feelsLike !== undefined &&
                  feelsLike !== currentTemp && (
                    <div className="text-xs text-muted-foreground">
                      Feels like {feelsLike}{tempUnit}
                    </div>
                  )}
              </div>
            </div>

            {todayForecast && (
              <div className="text-xs text-muted-foreground">
                {todayForecast.shortForecast}
              </div>
            )}

            {/* Today's High/Low */}
            {todayForecast && tonightForecast && (
              <div className="flex gap-3 text-xs">
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
          <div className="grid grid-cols-2 gap-2">
            <WeatherDetailItem
              icon={<Thermometer className="h-3 w-3" />}
              label="Dewpoint"
              value={dewpoint !== null ? `${dewpoint}${tempUnit}` : 'N/A'}
            />

            <WeatherDetailItem
              icon={<Droplets className="h-3 w-3" />}
              label="Humidity"
              value={humidity !== null ? `${humidity}%` : 'N/A'}
            />

            <WeatherDetailItem
              icon={<Wind className="h-3 w-3" />}
              label="Wind"
              value={
                windSpeed !== null
                  ? `${windDir || 'N/A'} ${windSpeed} ${speedUnit}`
                  : 'N/A'
              }
            />

            {windGust !== null && windGust > 0 && (
              <WeatherDetailItem
                icon={<Wind className="h-3 w-3" />}
                label="Gusts"
                value={`${windGust} ${speedUnit}`}
              />
            )}

            <WeatherDetailItem
              icon={<Eye className="h-3 w-3" />}
              label="Visibility"
              value={visibility ? `${visibility} ${distanceUnit}` : 'N/A'}
            />

            <WeatherDetailItem
              icon={<Cloud className="h-3 w-3" />}
              label="Cloud Cover"
              value={cloudCover}
            />

            {sunTimes && (
              <div className="flex items-center gap-1.5 rounded-lg border p-2">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1">
                    <Sunrise className="h-3 w-3 text-muted-foreground" />
                    <div className="text-[10px] text-muted-foreground">Sunrise</div>
                    <div className="ml-auto truncate text-xs font-medium">{formatTime(sunTimes.sunrise)}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sunset className="h-3 w-3 text-muted-foreground" />
                    <div className="text-[10px] text-muted-foreground">Sunset</div>
                    <div className="ml-auto truncate text-xs font-medium">{formatTime(sunTimes.sunset)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tonight's Forecast */}
        {tonightForecast && (
          <div className="mt-3 rounded-lg bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 p-3">
            <div className="flex items-center gap-2">
              <WeatherIcon
                nwsIconUrl={tonightForecast.icon}
                shortForecast={tonightForecast.shortForecast}
                size="sm"
                className="h-10 w-10"
              />
              <div>
                <div className="text-sm font-semibold text-white dark:text-gray-100">{tonightForecast.name}</div>
                <div className="text-xs text-gray-100 dark:text-gray-200">
                  {tonightForecast.shortForecast} -{' '}
                  {tonightForecast.temperature}{tempUnit}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </GlassCard>
  )
}

interface WeatherDetailItemProps {
  icon: React.ReactNode
  label: string
  value: string
}

function WeatherDetailItem({ icon, label, value }: WeatherDetailItemProps) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border p-2">
      <div className="text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] text-muted-foreground">{label}</div>
        <div className="truncate text-xs font-medium">{value}</div>
      </div>
    </div>
  )
}