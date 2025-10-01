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
  Legend,
} from 'recharts'
import { format } from 'date-fns'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useUnitConversion } from '@/hooks/useUnitConversion'

interface HourlyForecastProps {
  hourlyForecast: HourlyForecastType[]
}

type DataType = 'temperature' | 'precipitation' | 'wind' | 'humidity'
type Period = '12' | '24' | '48'

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

  const getBarColor = () => {
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
    <Card>
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
              >
                Temp
              </Button>
              <Button
                size="sm"
                variant={dataType === 'precipitation' ? 'default' : 'outline'}
                onClick={() => setDataType('precipitation')}
              >
                Precip
              </Button>
              <Button
                size="sm"
                variant={dataType === 'wind' ? 'default' : 'outline'}
                onClick={() => setDataType('wind')}
              >
                Wind
              </Button>
              <Button
                size="sm"
                variant={dataType === 'humidity' ? 'default' : 'outline'}
                onClick={() => setDataType('humidity')}
              >
                Humidity
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                label={{
                  value: unit,
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 12 },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                formatter={(value: number) => [`${value}${unit}`, getDataTypeLabel(dataType)]}
              />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={() => getDataTypeLabel(dataType)}
              />
              <Bar
                dataKey="value"
                fill={getBarColor()}
                radius={[4, 4, 0, 0]}
                name={getDataTypeLabel(dataType)}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 flex justify-around rounded-lg bg-muted p-3 text-sm">
          <div className="text-center">
            <div className="text-muted-foreground">Min</div>
            <div className="font-semibold">
              {Math.min(...chartData.map((d) => d.value))}
              {unit}
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">Max</div>
            <div className="font-semibold">
              {Math.max(...chartData.map((d) => d.value))}
              {unit}
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">Avg</div>
            <div className="font-semibold">
              {Math.round(
                chartData.reduce((acc, d) => acc + d.value, 0) /
                  chartData.length
              )}
              {unit}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}