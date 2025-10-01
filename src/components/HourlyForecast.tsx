import { HourlyForecast as HourlyForecastType } from '@/types/weather'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { format } from 'date-fns'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useUnitConversion } from '@/hooks/useUnitConversion'

interface HourlyForecastProps {
  hourlyForecast: HourlyForecastType[]
}

type DataType = 'temperature' | 'precipitation' | 'wind' | 'humidity'
type Period = '12' | '24' | '48'

interface TooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    payload: {
      unit: string
      label: string
    }
  }>
  label?: string
}

// Custom tooltip component with glass morphism
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload || !payload.length) return null

  const data = payload[0]
  if (!data) return null

  const value = data.value
  const unit = data.payload.unit
  const dataLabel = data.payload.label

  return (
    <div className="glass-card-strong rounded-xl p-4 shadow-glass-lg transition-all duration-300 animate-in fade-in zoom-in-95">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground/90">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold gradient-accent-text">
            {typeof value === 'number' ? Math.round(value) : value}
            <span className="text-sm ml-1">{unit}</span>
          </p>
        </div>
        <p className="text-xs text-muted-foreground">{dataLabel}</p>
      </div>
    </div>
  )
}

interface CursorProps {
  x?: number
  y?: number
  width?: number
  height?: number
}

// Custom cursor component with glow effect
const CustomCursor = (props: CursorProps) => {
  const { x, y, width, height } = props
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="url(#cursorGradient)"
      opacity={0.1}
      className="transition-all duration-200"
    />
  )
}

export function HourlyForecast({ hourlyForecast }: HourlyForecastProps) {
  const { convertTemperature, convertWindSpeed } = useUnitConversion()
  const [dataType, setDataType] = useLocalStorage<DataType>('hourly-chart-dataType', 'temperature')
  const [period, setPeriod] = useLocalStorage<Period>('hourly-chart-period', '24')

  const getPeriodData = () => {
    const hours = parseInt(period)
    return hourlyForecast.slice(0, hours)
  }

  // Helper to convert temperature from F (NWS format) to current unit system
  const convertTemp = (tempF: number) => {
    return convertTemperature(tempF, 'F').value
  }

  // Helper to parse and convert wind speed from mph (NWS format) to current unit system
  const parseWindSpeed = (windSpeed?: string): number => {
    if (!windSpeed) return 0
    const match = windSpeed.match(/(\d+)/)
    const speedMph = match && match[1] ? parseInt(match[1], 10) : 0
    return convertWindSpeed(speedMph, 'mph').value
  }

  const formatChartData = () => {
    const data = getPeriodData()

    return data.map((forecast) => {
      const time = format(new Date(forecast.startTime), 'ha')

      switch (dataType) {
        case 'temperature':
          return {
            time,
            value: convertTemp(forecast.temperature),
            label: 'Temperature',
            unit: convertTemperature(0, 'F').unit === 'F' ? '°F' : '°C',
          }
        case 'precipitation':
          return {
            time,
            value: forecast.probabilityOfPrecipitation?.value || 0,
            label: 'Precipitation',
            unit: '%',
          }
        case 'wind':
          return {
            time,
            value: parseWindSpeed(forecast.windSpeed),
            label: 'Wind Speed',
            unit: convertWindSpeed(0, 'mph').unit,
          }
        case 'humidity':
          return {
            time,
            value: forecast.relativeHumidity.value,
            label: 'Humidity',
            unit: '%',
          }
        default:
          return { time, value: 0, label: '', unit: '' }
      }
    })
  }

  const chartData = formatChartData()
  const firstItem = chartData[0]
  const unit = firstItem?.unit || ''

  // Get gradient colors based on data type
  const getGradientColors = () => {
    switch (dataType) {
      case 'temperature':
        return {
          start: 'hsl(200, 100%, 70%)', // Cool blue
          mid: 'hsl(280, 80%, 75%)', // Purple
          end: 'hsl(340, 80%, 60%)', // Warm red
          fill: 'url(#temperatureGradient)',
          stroke: 'hsl(280, 80%, 75%)',
          glow: 'rgba(200, 120, 255, 0.3)',
        }
      case 'precipitation':
        return {
          start: 'hsl(200, 100%, 80%)', // Light water blue
          mid: 'hsl(200, 95%, 60%)', // Water blue
          end: 'hsl(220, 90%, 50%)', // Deep water blue
          fill: 'url(#precipitationGradient)',
          stroke: 'hsl(200, 95%, 60%)',
          glow: 'rgba(96, 165, 250, 0.3)',
        }
      case 'wind':
        return {
          start: 'hsl(160, 75%, 70%)', // Light green
          mid: 'hsl(160, 75%, 50%)', // Green
          end: 'hsl(140, 80%, 45%)', // Deep green
          fill: 'url(#windGradient)',
          stroke: 'hsl(160, 75%, 50%)',
          glow: 'rgba(74, 222, 128, 0.3)',
        }
      case 'humidity':
        return {
          start: 'hsl(190, 95%, 80%)', // Light aqua
          mid: 'hsl(190, 95%, 65%)', // Aqua
          end: 'hsl(200, 100%, 55%)', // Deep aqua
          fill: 'url(#humidityGradient)',
          stroke: 'hsl(190, 95%, 65%)',
          glow: 'rgba(34, 211, 238, 0.3)',
        }
      default:
        return {
          start: 'hsl(200, 95%, 60%)',
          mid: 'hsl(200, 95%, 60%)',
          end: 'hsl(200, 95%, 60%)',
          fill: 'url(#defaultGradient)',
          stroke: 'hsl(200, 95%, 60%)',
          glow: 'rgba(96, 165, 250, 0.3)',
        }
    }
  }

  const gradientColors = getGradientColors()

  const getDataTypeLabel = (type: DataType) => {
    switch (type) {
      case 'temperature':
        return 'Temperature'
      case 'precipitation':
        return 'Precipitation'
      case 'wind':
        return 'Wind Speed'
      case 'humidity':
        return 'Humidity'
      default:
        return type
    }
  }

  // Determine whether to use Area or Bar chart based on data type
  const useAreaChart = dataType === 'temperature'

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Hourly Forecast</CardTitle>

          <div className="flex flex-wrap gap-3">
            {/* Period Selector */}
            <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
              <SelectTrigger className="w-[120px]" aria-label="Time period selection">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 Hours</SelectItem>
                <SelectItem value="24">24 Hours</SelectItem>
                <SelectItem value="48">48 Hours</SelectItem>
              </SelectContent>
            </Select>

            {/* Data Type Buttons */}
            <div className="flex gap-2" role="group" aria-label="Data type selection">
              <Button
                size="sm"
                variant={dataType === 'temperature' ? 'default' : 'outline'}
                onClick={() => setDataType('temperature')}
                className="transition-all duration-300 hover:scale-105"
              >
                Temp
              </Button>
              <Button
                size="sm"
                variant={dataType === 'precipitation' ? 'default' : 'outline'}
                onClick={() => setDataType('precipitation')}
                className="transition-all duration-300 hover:scale-105"
              >
                Precip
              </Button>
              <Button
                size="sm"
                variant={dataType === 'wind' ? 'default' : 'outline'}
                onClick={() => setDataType('wind')}
                className="transition-all duration-300 hover:scale-105"
              >
                Wind
              </Button>
              <Button
                size="sm"
                variant={dataType === 'humidity' ? 'default' : 'outline'}
                onClick={() => setDataType('humidity')}
                className="transition-all duration-300 hover:scale-105"
              >
                Humidity
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="relative rounded-2xl p-6 transition-all duration-500 glass-card-subtle"
          style={{
            boxShadow: `0 8px 32px rgba(0, 0, 0, 0.1), 0 0 40px ${gradientColors.glow}`,
          }}
        >
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {useAreaChart ? (
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    {/* Temperature Gradient */}
                    <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={gradientColors.start} stopOpacity={0.8} />
                      <stop offset="50%" stopColor={gradientColors.mid} stopOpacity={0.6} />
                      <stop offset="100%" stopColor={gradientColors.end} stopOpacity={0.2} />
                    </linearGradient>

                    {/* Precipitation Gradient */}
                    <linearGradient id="precipitationGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={gradientColors.start} stopOpacity={0.8} />
                      <stop offset="50%" stopColor={gradientColors.mid} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={gradientColors.end} stopOpacity={0.1} />
                    </linearGradient>

                    {/* Wind Gradient */}
                    <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={gradientColors.start} stopOpacity={0.8} />
                      <stop offset="50%" stopColor={gradientColors.mid} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={gradientColors.end} stopOpacity={0.1} />
                    </linearGradient>

                    {/* Humidity Gradient */}
                    <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={gradientColors.start} stopOpacity={0.8} />
                      <stop offset="50%" stopColor={gradientColors.mid} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={gradientColors.end} stopOpacity={0.1} />
                    </linearGradient>

                    {/* Cursor Gradient */}
                    <linearGradient id="cursorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={gradientColors.stroke} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={gradientColors.stroke} stopOpacity={0.05} />
                    </linearGradient>

                    {/* Glow filter for hover effects */}
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="currentColor"
                    strokeOpacity={0.1}
                    strokeWidth={0.5}
                    className="transition-all duration-300"
                  />

                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.7 }}
                    tickLine={{ stroke: 'currentColor', opacity: 0.2 }}
                    axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
                    className="text-muted-foreground"
                  />

                  <YAxis
                    tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.7 }}
                    tickLine={{ stroke: 'currentColor', opacity: 0.2 }}
                    axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
                    className="text-muted-foreground"
                    label={{
                      value: unit,
                      angle: -90,
                      position: 'insideLeft',
                      style: { fontSize: 11, fill: 'currentColor', opacity: 0.7 },
                    }}
                  />

                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={<CustomCursor />}
                    animationDuration={200}
                    animationEasing="ease-out"
                  />

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={gradientColors.stroke}
                    strokeWidth={3}
                    fill={gradientColors.fill}
                    name={getDataTypeLabel(dataType)}
                    animationDuration={800}
                    animationEasing="ease-in-out"
                    dot={{
                      r: 4,
                      fill: gradientColors.stroke,
                      strokeWidth: 2,
                      stroke: 'hsl(var(--background))',
                    }}
                    activeDot={{
                      r: 6,
                      fill: gradientColors.stroke,
                      strokeWidth: 3,
                      stroke: 'hsl(var(--background))',
                      filter: 'url(#glow)',
                      className: 'transition-all duration-200',
                    }}
                  />
                </AreaChart>
              ) : (
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    {/* Precipitation Gradient */}
                    <linearGradient id="precipitationGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={gradientColors.start} stopOpacity={0.9} />
                      <stop offset="50%" stopColor={gradientColors.mid} stopOpacity={0.7} />
                      <stop offset="100%" stopColor={gradientColors.end} stopOpacity={0.5} />
                    </linearGradient>

                    {/* Wind Gradient */}
                    <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={gradientColors.start} stopOpacity={0.9} />
                      <stop offset="50%" stopColor={gradientColors.mid} stopOpacity={0.7} />
                      <stop offset="100%" stopColor={gradientColors.end} stopOpacity={0.5} />
                    </linearGradient>

                    {/* Humidity Gradient */}
                    <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={gradientColors.start} stopOpacity={0.9} />
                      <stop offset="50%" stopColor={gradientColors.mid} stopOpacity={0.7} />
                      <stop offset="100%" stopColor={gradientColors.end} stopOpacity={0.5} />
                    </linearGradient>

                    {/* Cursor Gradient */}
                    <linearGradient id="cursorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={gradientColors.stroke} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={gradientColors.stroke} stopOpacity={0.05} />
                    </linearGradient>

                    {/* Glow filter */}
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="currentColor"
                    strokeOpacity={0.1}
                    strokeWidth={0.5}
                    className="transition-all duration-300"
                  />

                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.7 }}
                    tickLine={{ stroke: 'currentColor', opacity: 0.2 }}
                    axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
                    className="text-muted-foreground"
                  />

                  <YAxis
                    tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.7 }}
                    tickLine={{ stroke: 'currentColor', opacity: 0.2 }}
                    axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
                    className="text-muted-foreground"
                    label={{
                      value: unit,
                      angle: -90,
                      position: 'insideLeft',
                      style: { fontSize: 11, fill: 'currentColor', opacity: 0.7 },
                    }}
                  />

                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={<CustomCursor />}
                    animationDuration={200}
                    animationEasing="ease-out"
                  />

                  <Bar
                    dataKey="value"
                    fill={gradientColors.fill}
                    radius={[8, 8, 0, 0]}
                    name={getDataTypeLabel(dataType)}
                    animationDuration={800}
                    animationEasing="ease-in-out"
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Stats with Glass Effect */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-glass">
            <div className="text-xs font-medium text-muted-foreground mb-2">Minimum</div>
            <div className="text-xl font-bold gradient-accent-text">
              {Math.min(...chartData.map((d) => d.value))}
              <span className="text-sm ml-1">{unit}</span>
            </div>
          </div>

          <div className="glass-card rounded-xl p-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-glass">
            <div className="text-xs font-medium text-muted-foreground mb-2">Average</div>
            <div className="text-xl font-bold gradient-accent-text">
              {Math.round(
                chartData.reduce((acc, d) => acc + d.value, 0) / chartData.length
              )}
              <span className="text-sm ml-1">{unit}</span>
            </div>
          </div>

          <div className="glass-card rounded-xl p-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-glass">
            <div className="text-xs font-medium text-muted-foreground mb-2">Maximum</div>
            <div className="text-xl font-bold gradient-accent-text">
              {Math.max(...chartData.map((d) => d.value))}
              <span className="text-sm ml-1">{unit}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
