import { Observation, ForecastPeriod, SunTimes } from '@/types/weather'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <Card className="group overflow-hidden border-[0.5px] border-border/50 bg-gradient-to-br from-card/95 via-card/90 to-card/95 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <CardHeader className="relative space-y-0 pb-3">
        <CardTitle className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text text-transparent">
          Current Conditions
        </CardTitle>
      </CardHeader>

      <CardContent className="relative">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Weather - Hero Section */}
          <div className="space-y-5">
            <div className="group/hero flex items-center gap-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 p-5 backdrop-blur-sm transition-all duration-300 hover:from-muted/60 hover:to-muted/40">
              {todayForecast && (
                <div className="relative">
                  <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 blur-xl transition-opacity duration-300 group-hover/hero:opacity-100" />
                  <img
                    src={todayForecast.icon}
                    alt={todayForecast.shortForecast}
                    className="relative h-24 w-24 transform transition-transform duration-500 group-hover/hero:scale-110"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <div className="bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-6xl font-black tabular-nums text-transparent transition-all duration-300">
                  {currentTemp !== null && currentTemp !== undefined
                    ? `${currentTemp}${tempUnit}`
                    : 'N/A'}
                </div>
                {feelsLike !== null &&
                  feelsLike !== undefined &&
                  feelsLike !== currentTemp && (
                    <div className="animate-fade-in text-sm font-medium text-muted-foreground/80">
                      Feels like <span className="font-semibold text-foreground/70">{feelsLike}{tempUnit}</span>
                    </div>
                  )}
              </div>
            </div>

            {todayForecast && (
              <div className="rounded-xl bg-gradient-to-r from-muted/40 to-muted/20 px-4 py-3 text-sm font-medium text-muted-foreground backdrop-blur-sm">
                {todayForecast.shortForecast}
              </div>
            )}

            {/* Today's High/Low */}
            {todayForecast && tonightForecast && (
              <div className="flex gap-3">
                <div className="group/temp flex-1 rounded-xl border-[0.5px] border-border/50 bg-gradient-to-br from-red-500/10 to-orange-500/10 px-4 py-3 backdrop-blur-sm transition-all duration-300 hover:border-red-500/30 hover:from-red-500/15 hover:to-orange-500/15">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">High</div>
                  <div className="mt-1 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-2xl font-bold tabular-nums text-transparent dark:from-red-400 dark:to-orange-400">
                    {todayForecast.temperature}{tempUnit}
                  </div>
                </div>
                <div className="group/temp flex-1 rounded-xl border-[0.5px] border-border/50 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 px-4 py-3 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/30 hover:from-blue-500/15 hover:to-cyan-500/15">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">Low</div>
                  <div className="mt-1 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-2xl font-bold tabular-nums text-transparent dark:from-blue-400 dark:to-cyan-400">
                    {tonightForecast.temperature}{tempUnit}
                  </div>
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
              gradient="from-amber-500/10 to-yellow-500/10"
              hoverGradient="hover:from-amber-500/15 hover:to-yellow-500/15"
              iconColor="text-amber-600 dark:text-amber-400"
            />

            <WeatherDetailItem
              icon={<Droplets className="h-4 w-4" />}
              label="Humidity"
              value={humidity !== null ? `${humidity}%` : 'N/A'}
              gradient="from-blue-500/10 to-cyan-500/10"
              hoverGradient="hover:from-blue-500/15 hover:to-cyan-500/15"
              iconColor="text-blue-600 dark:text-blue-400"
            />

            <WeatherDetailItem
              icon={<Wind className="h-4 w-4" />}
              label="Wind"
              value={
                windSpeed !== null
                  ? `${windDir || 'N/A'} ${windSpeed} ${speedUnit}`
                  : 'N/A'
              }
              gradient="from-emerald-500/10 to-teal-500/10"
              hoverGradient="hover:from-emerald-500/15 hover:to-teal-500/15"
              iconColor="text-emerald-600 dark:text-emerald-400"
            />

            {windGust !== null && windGust > 0 && (
              <WeatherDetailItem
                icon={<Wind className="h-4 w-4" />}
                label="Gusts"
                value={`${windGust} ${speedUnit}`}
                gradient="from-emerald-500/10 to-green-500/10"
                hoverGradient="hover:from-emerald-500/15 hover:to-green-500/15"
                iconColor="text-emerald-600 dark:text-emerald-400"
              />
            )}

            <WeatherDetailItem
              icon={<Eye className="h-4 w-4" />}
              label="Visibility"
              value={visibility ? `${visibility} ${distanceUnit}` : 'N/A'}
              gradient="from-purple-500/10 to-violet-500/10"
              hoverGradient="hover:from-purple-500/15 hover:to-violet-500/15"
              iconColor="text-purple-600 dark:text-purple-400"
            />

            <WeatherDetailItem
              icon={<Cloud className="h-4 w-4" />}
              label="Cloud Cover"
              value={cloudCover}
              gradient="from-slate-500/10 to-gray-500/10"
              hoverGradient="hover:from-slate-500/15 hover:to-gray-500/15"
              iconColor="text-slate-600 dark:text-slate-400"
            />

            {sunTimes && (
              <>
                <WeatherDetailItem
                  icon={<Sunrise className="h-4 w-4" />}
                  label="Sunrise"
                  value={formatTime(sunTimes.sunrise)}
                  gradient="from-orange-500/10 to-pink-500/10"
                  hoverGradient="hover:from-orange-500/15 hover:to-pink-500/15"
                  iconColor="text-orange-600 dark:text-orange-400"
                />

                <WeatherDetailItem
                  icon={<Sunset className="h-4 w-4" />}
                  label="Sunset"
                  value={formatTime(sunTimes.sunset)}
                  gradient="from-indigo-500/10 to-purple-500/10"
                  hoverGradient="hover:from-indigo-500/15 hover:to-purple-500/15"
                  iconColor="text-indigo-600 dark:text-indigo-400"
                />
              </>
            )}
          </div>
        </div>

        {/* Detailed Forecast */}
        {todayForecast?.detailedForecast && (
          <div className="mt-6 overflow-hidden rounded-2xl border-[0.5px] border-border/50 bg-gradient-to-br from-muted/60 via-muted/40 to-muted/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-border/70 hover:from-muted/70 hover:via-muted/50 hover:to-muted/70">
            <h3 className="mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-sm font-bold uppercase tracking-wider text-transparent">
              Forecast
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground/90">
              {todayForecast.detailedForecast}
            </p>
          </div>
        )}

        {/* Tonight's Forecast */}
        {tonightForecast && (
          <div className="group/tonight mt-4 overflow-hidden rounded-2xl border-[0.5px] border-border/50 bg-gradient-to-br from-card/60 via-card/40 to-card/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-border/70 hover:shadow-lg">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 blur-lg transition-opacity duration-300 group-hover/tonight:opacity-100" />
                <img
                  src={tonightForecast.icon}
                  alt={tonightForecast.shortForecast}
                  className="relative h-14 w-14 transform transition-transform duration-300 group-hover/tonight:scale-110"
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="font-bold text-foreground">{tonightForecast.name}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{tonightForecast.shortForecast}</span>
                  <span className="text-xs">•</span>
                  <span className="font-semibold text-foreground/80">
                    {tonightForecast.temperature}{tempUnit}
                  </span>
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
  gradient?: string
  hoverGradient?: string
  iconColor?: string
}

function WeatherDetailItem({
  icon,
  label,
  value,
  gradient = "from-muted/40 to-muted/20",
  hoverGradient = "hover:from-muted/50 hover:to-muted/30",
  iconColor = "text-muted-foreground"
}: WeatherDetailItemProps) {
  return (
    <div className={`group/item overflow-hidden rounded-xl border-[0.5px] border-border/50 bg-gradient-to-br ${gradient} p-3.5 backdrop-blur-sm transition-all duration-300 ${hoverGradient} hover:border-border/70 hover:shadow-md`}>
      <div className="flex items-center gap-2.5">
        <div className={`${iconColor} transform transition-all duration-300 group-hover/item:scale-110 group-hover/item:drop-shadow-md`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {label}
          </div>
          <div className="mt-0.5 truncate text-sm font-bold text-foreground transition-all duration-300 group-hover/item:text-foreground">
            {value}
          </div>
        </div>
      </div>
    </div>
  )
}
