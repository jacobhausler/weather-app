import { HourlyForecast as HourlyForecastType } from '@/types/weather'
import { GlassCard, CardContent, CardHeader, CardTitle } from '@/components/ui/glass-card'
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
  Legend,
} from 'recharts'
import { format } from 'date-fns'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useUnitStore, convertTempFromF, convertSpeedFromMph, getTempUnit, getSpeedUnit } from '@/stores/unitStore'

interface HourlyForecastProps {
  hourlyForecast: HourlyForecastType[]
}

type DataType = 'temperature' | 'precipitation' | 'wind' | 'humidity'
type Period = '12' | '24' | '48'

export function HourlyForecast({ hourlyForecast }: HourlyForecastProps) {
  const { unitSystem } = useUnitStore()
  const [dataTypes, setDataTypes] = useLocalStorage<DataType[]>('hourly-chart-dataTypes', ['temperature'])
  const [period, setPeriod] = useLocalStorage<Period>('hourly-chart-period', '24')
  const [clickCount, setClickCount] = useLocalStorage<number>('hourly-chart-clickCount', 0)

  const getPeriodData = () => {
    const hours = parseInt(period)
    return hourlyForecast.slice(0, hours)
  }

  // Helper to convert temperature from F (NWS format) to current unit system
  const convertTemp = (tempF: number) => {
    return Math.round(convertTempFromF(tempF, unitSystem))
  }

  // Helper to parse and convert wind speed from mph (NWS format) to current unit system
  const parseWindSpeed = (windSpeed?: string): number => {
    if (!windSpeed) return 0
    const match = windSpeed.match(/(\d+)/)
    const speedMph = match && match[1] ? parseInt(match[1], 10) : 0
    return Math.round(convertSpeedFromMph(speedMph, unitSystem))
  }

  const getDataValue = (forecast: HourlyForecastType, dataType: DataType) => {
    switch (dataType) {
      case 'temperature':
        return convertTemp(forecast.temperature)
      case 'precipitation':
        return forecast.probabilityOfPrecipitation?.value || 0
      case 'wind':
        return parseWindSpeed(forecast.windSpeed)
      case 'humidity':
        return forecast.relativeHumidity.value
      default:
        return 0
    }
  }

  const getDataUnit = (dataType: DataType) => {
    switch (dataType) {
      case 'temperature':
        return getTempUnit(unitSystem)
      case 'precipitation':
        return '%'
      case 'wind':
        return getSpeedUnit(unitSystem)
      case 'humidity':
        return '%'
      default:
        return ''
    }
  }

  const formatChartData = () => {
    const data = getPeriodData()

    return data.map((forecast) => {
      const time = format(new Date(forecast.startTime), 'ha')
      const dataPoint: Record<string, string | number> = { time }

      dataTypes.forEach((dataType) => {
        dataPoint[dataType] = getDataValue(forecast, dataType)
      })

      return dataPoint
    })
  }

  const chartData = formatChartData()

  const getBarColor = (dataType: DataType) => {
    switch (dataType) {
      case 'temperature':
        return 'hsl(var(--chart-1))'
      case 'precipitation':
        return 'hsl(var(--chart-2))'
      case 'wind':
        return 'hsl(var(--chart-3))'
      case 'humidity':
        return 'hsl(var(--chart-4))'
      default:
        return 'hsl(var(--chart-1))'
    }
  }

  const handleDataTypeClick = (clickedType: DataType) => {
    if (dataTypes.length === 0) {
      // First click: add as first dimension
      setDataTypes([clickedType])
      setClickCount(1)
    } else if (dataTypes.length === 1) {
      const firstType = dataTypes[0]
      if (!firstType) return

      if (firstType === clickedType) {
        // Clicking same type: deselect
        setDataTypes([])
        setClickCount(0)
      } else {
        // Second click: add as second dimension
        setDataTypes([firstType, clickedType])
        setClickCount(2)
      }
    } else if (dataTypes.length === 2) {
      if (dataTypes.includes(clickedType)) {
        // Clicking one of the two selected: remove it
        setDataTypes(dataTypes.filter((type) => type !== clickedType))
        setClickCount(1)
      } else {
        // 3rd click replaces first, 4th replaces second, 5th replaces first, etc.
        const newClickCount = clickCount + 1
        setClickCount(newClickCount)

        const replaceIndex = (newClickCount % 2) === 1 ? 0 : 1 // odd clicks (3,5,7...) replace first, even clicks (4,6,8...) replace second

        if (replaceIndex === 0) {
          const secondType = dataTypes[1]
          if (!secondType) return
          setDataTypes([clickedType, secondType])
        } else {
          const firstType = dataTypes[0]
          if (!firstType) return
          setDataTypes([firstType, clickedType])
        }
      }
    }
  }

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

  return (
    <GlassCard blur="lg" gradient interactive className="shadow-glass border border-white/30 dark:border-white/15">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-white dark:text-gray-100">Hourly Forecast</CardTitle>

          <div className="flex flex-wrap gap-2">
            {/* Period Selector */}
            <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
              <SelectTrigger className="w-[110px]" aria-label="Time period selection">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 Hours</SelectItem>
                <SelectItem value="24">24 Hours</SelectItem>
                <SelectItem value="48">48 Hours</SelectItem>
              </SelectContent>
            </Select>

            {/* Data Type Buttons */}
            <div className="flex gap-1.5" role="group" aria-label="Data type selection">
              <Button
                size="sm"
                variant={dataTypes.includes('temperature') ? 'default' : 'outline'}
                onClick={() => handleDataTypeClick('temperature')}
              >
                Temp
              </Button>
              <Button
                size="sm"
                variant={dataTypes.includes('precipitation') ? 'default' : 'outline'}
                onClick={() => handleDataTypeClick('precipitation')}
              >
                Precip
              </Button>
              <Button
                size="sm"
                variant={dataTypes.includes('wind') ? 'default' : 'outline'}
                onClick={() => handleDataTypeClick('wind')}
              >
                Wind
              </Button>
              <Button
                size="sm"
                variant={dataTypes.includes('humidity') ? 'default' : 'outline'}
                onClick={() => handleDataTypeClick('humidity')}
              >
                Humidity
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full bg-transparent">
          <ResponsiveContainer width="100%" height="100%" className="bg-transparent">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              {dataTypes.length > 0 && dataTypes[0] && (
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  label={{
                    value: getDataUnit(dataTypes[0]),
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 12 },
                  }}
                />
              )}
              {dataTypes.length > 1 && dataTypes[1] && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  label={{
                    value: getDataUnit(dataTypes[1]),
                    angle: 90,
                    position: 'insideRight',
                    style: { fontSize: 12 },
                  }}
                />
              )}
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                formatter={(value: number, name: string) => {
                  const dataType = name as DataType
                  const unit = getDataUnit(dataType)
                  return [`${value}${unit}`, getDataTypeLabel(dataType)]
                }}
              />
              {dataTypes.length > 0 && (
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                />
              )}
              {dataTypes.map((dataType, index) => (
                <Bar
                  key={dataType}
                  dataKey={dataType}
                  fill={getBarColor(dataType)}
                  radius={[4, 4, 0, 0]}
                  name={dataType}
                  yAxisId={index === 0 ? 'left' : 'right'}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        {dataTypes.length > 0 && (
          <div className="mt-3 space-y-2">
            {dataTypes.map((dataType) => {
              const values = chartData.map((d) => d[dataType] as number)
              const unit = getDataUnit(dataType)
              const min = Math.min(...values)
              const max = Math.max(...values)
              const avg = Math.round(values.reduce((acc, v) => acc + v, 0) / values.length)

              return (
                <div
                  key={dataType}
                  className="flex justify-between items-center rounded-lg bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 p-2 text-xs"
                >
                  <div className="font-semibold text-[10px] text-muted-foreground">
                    {getDataTypeLabel(dataType)}
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="text-[10px] text-muted-foreground">Min</div>
                      <div className="font-semibold">
                        {min}
                        {unit}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] text-muted-foreground">Max</div>
                      <div className="font-semibold">
                        {max}
                        {unit}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] text-muted-foreground">Avg</div>
                      <div className="font-semibold">
                        {avg}
                        {unit}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </GlassCard>
  )
}