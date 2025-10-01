import { Header } from './components/Header'
import { ErrorBanner } from './components/ErrorBanner'
import { ThemeToggle } from './components/ThemeToggle'
import { UnitToggle } from './components/UnitToggle'
import { AlertCard } from './components/AlertCard'
import { SevenDayForecast } from './components/SevenDayForecast'
import { CurrentConditions } from './components/CurrentConditions'
import { HourlyForecast } from './components/HourlyForecast'
import { Skeleton } from './components/ui/skeleton'
import { Card, CardContent, CardHeader } from './components/ui/card'
import { useWeatherData } from './hooks/useWeatherData'

function App() {
  const { weatherData, isLoading } = useWeatherData()

  // Get today and tonight forecast periods
  const todayForecast = weatherData?.forecast.find((p) => p.isDaytime && p.number === 1)
  const tonightForecast = weatherData?.forecast.find((p) => !p.isDaytime && p.number === 2)

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ paddingBottom: 'var(--footer-height)' }}>
      <ErrorBanner />
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {[...Array(7)].map((_, i) => (
                    <Skeleton key={i} className="min-w-[140px] h-48" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !weatherData && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-semibold text-muted-foreground">
                Welcome to HAUS Weather Station
              </h2>
              <p className="text-lg text-muted-foreground max-w-md">
                Enter a ZIP code above to view detailed weather information
              </p>
            </div>
          </div>
        )}

        {/* Weather Data */}
        {!isLoading && weatherData && (
          <div className="space-y-6">
            {/* Alert Card - Conditionally rendered */}
            {weatherData.alerts && weatherData.alerts.length > 0 && (
              <AlertCard alerts={weatherData.alerts} />
            )}

            {/* 7-Day Forecast Card */}
            {weatherData.forecast && weatherData.forecast.length > 0 && (
              <SevenDayForecast forecast={weatherData.forecast} />
            )}

            {/* Current Conditions + Daily Forecast Card */}
            <CurrentConditions
              observation={weatherData.currentObservation}
              todayForecast={todayForecast}
              tonightForecast={tonightForecast}
              sunTimes={weatherData.sunTimes}
            />

            {/* Hourly Forecast Card */}
            {weatherData.hourlyForecast && weatherData.hourlyForecast.length > 0 && (
              <HourlyForecast hourlyForecast={weatherData.hourlyForecast} />
            )}
          </div>
        )}
      </main>

      {/* Footer with theme and unit toggles */}
      <footer className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" style={{ height: 'var(--footer-height)' }}>
        <div className="container mx-auto flex items-center justify-between px-4 h-full">
          <UnitToggle />
          <ThemeToggle />
        </div>
      </footer>
    </div>
  )
}

export default App