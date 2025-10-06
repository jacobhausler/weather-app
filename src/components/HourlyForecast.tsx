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
  const [dataType, setDataType] = useLocalStorage<DataType>('hourly-chart-dataType', 'temperature')
  const [dataType2, setDataType2] = useLocalStorage<DataType | null>('hourly-chart-dataType2', null)
  const [nextToReplace, setNextToReplace] = useLocalStorage<'primary' | 'secondary'>('hourly-chart-nextToReplace', 'primary')
  const [period, setPeriod] = useLocalStorage<Period>('hourly-chart-period', '24')

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

  const getValueForDataType = (forecast: HourlyForecastType, type: DataType) => {
    switch (type) {
      case 'temperature':
        return convertTemp(forecast.temperature)
      case 'precipitation':
        return forecast.probabilityOfPrecipitation?.value || 0
      case 'wind':
        return parseWindSpeed(forecast.windSpeed)
      case 'humidity':
        return forecast.relativeHumidity.value
    }
  }

  const getUnitForDataType = (type: DataType) => {
    switch (type) {
      case 'temperature':
        return getTempUnit(unitSystem)
      case 'precipitation':
        return '%'
      case 'wind':
        return getSpeedUnit(unitSystem)
      case 'humidity':
        return '%'
    }
  }

  const formatChartData = () => {
    const data = getPeriodData()

    return data.map((forecast) => {
      const time = format(new Date(forecast.startTime), 'ha')
      const chartPoint: any = {
        time,
        value: getValueForDataType(forecast, dataType),
      }

      if (dataType2) {
        chartPoint.value2 = getValueForDataType(forecast, dataType2)
      }

      return chartPoint
    })
  }

  const chartData = formatChartData()
  const unit = getUnitForDataType(dataType)
  const unit2 = dataType2 ? getUnitForDataType(dataType2) : ''

  const getBarColor = (type: DataType) => {
    switch (type) {
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
              {(['temperature', 'precipitation', 'wind', 'humidity'] as const).map((type) => {
                const isSelected = dataType === type || dataType2 === type
                const handleClick = () => {
                  if (dataType === type || dataType2 === type) {
                    // Already selected - do nothing (clicking selected items doesn't deselect)
                    return
                  } else if (!dataType2) {
                    // No secondary selected - set as secondary
                    setDataType2(type)
                  } else {
                    // Both slots filled - replace based on nextToReplace
                    if (nextToReplace === 'primary') {
                      setDataType(type)
                      setNextToReplace('secondary')
                    } else {
                      setDataType2(type)
                      setNextToReplace('primary')
                    }
                  }
                }

                return (
                  <Button
                    key={type}
                    size="sm"
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={handleClick}
                  >
                    {type === 'temperature' ? 'Temp' :
                     type === 'precipitation' ? 'Precip' :
                     type === 'wind' ? 'Wind' : 'Humidity'}
                  </Button>
                )
              })}
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
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                label={{
                  value: unit,
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 12 },
                }}
              />
              {dataType2 && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  label={{
                    value: unit2,
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
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                yAxisId="left"
                dataKey="value"
                fill={getBarColor(dataType)}
                radius={[4, 4, 0, 0]}
                name={getDataTypeLabel(dataType)}
              />
              {dataType2 && (
                <Bar
                  yAxisId="right"
                  dataKey="value2"
                  fill={getBarColor(dataType2)}
                  radius={[4, 4, 0, 0]}
                  name={getDataTypeLabel(dataType2)}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex justify-around rounded-lg bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 p-2 text-xs">
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground">{getDataTypeLabel(dataType)} Min</div>
              <div className="font-semibold">
                {Math.min(...chartData.map((d) => d.value))}
                {unit}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground">Max</div>
              <div className="font-semibold">
                {Math.max(...chartData.map((d) => d.value))}
                {unit}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground">Avg</div>
              <div className="font-semibold">
                {Math.round(
                  chartData.reduce((acc, d) => acc + d.value, 0) /
                    chartData.length
                )}
                {unit}
              </div>
            </div>
          </div>

          {dataType2 && (
            <div className="flex justify-around rounded-lg bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 p-2 text-xs">
              <div className="text-center">
                <div className="text-[10px] text-muted-foreground">{getDataTypeLabel(dataType2)} Min</div>
                <div className="font-semibold">
                  {Math.min(...chartData.map((d) => d.value2))}
                  {unit2}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-muted-foreground">Max</div>
                <div className="font-semibold">
                  {Math.max(...chartData.map((d) => d.value2))}
                  {unit2}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-muted-foreground">Avg</div>
                <div className="font-semibold">
                  {Math.round(
                    chartData.reduce((acc, d) => acc + d.value2, 0) /
                      chartData.length
                  )}
                  {unit2}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </GlassCard>
  )
}