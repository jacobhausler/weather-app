import { lazy, Suspense } from 'react'
import { Header } from './components/Header'
import { ErrorBanner } from './components/ErrorBanner'
import { ThemeToggle } from './components/ThemeToggle'
import { UnitToggle } from './components/UnitToggle'
import { Skeleton } from './components/ui/skeleton'
import { useWeatherData } from './hooks/useWeatherData'

// Lazy load heavy components (charts, modals)
const AlertCard = lazy(() => import('./components/AlertCard').then(m => ({ default: m.AlertCard })))
const SevenDayForecast = lazy(() => import('./components/SevenDayForecast').then(m => ({ default: m.SevenDayForecast })))
const CurrentConditions = lazy(() => import('./components/CurrentConditions').then(m => ({ default: m.CurrentConditions })))
const HourlyForecast = lazy(() => import('./components/HourlyForecast').then(m => ({ default: m.HourlyForecast })))
const RadarMap = lazy(() => import('./components/RadarMap').then(m => ({ default: m.RadarMap })))

function App() {
  const { weatherData, isLoading } = useWeatherData()

  // Get today and tonight forecast periods
  const todayForecast = weatherData?.forecast.find((p) => p.isDaytime && p.number === 1)
  const tonightForecast = weatherData?.forecast.find((p) => !p.isDaytime && p.number === 2)

  return (
    <div className="min-h-screen bg-gradient-sky dark:bg-gradient-midnight text-foreground" style={{ paddingBottom: 'var(--footer-height)' }}>
      <ErrorBanner />
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex flex-col gap-6 lg:w-2/3">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-80 w-full" />
              </div>
              <div className="lg:w-1/3">
                <Skeleton className="h-[600px] w-full" />
              </div>
            </div>
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
              <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                <AlertCard alerts={weatherData.alerts} />
              </Suspense>
            )}

            {/* Two-column layout: left stacked tiles, right 7-day forecast */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left column: Current Conditions, Hourly Forecast, Radar */}
              <div className="flex flex-col gap-6 lg:w-2/3">
                <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                  <CurrentConditions
                    observation={weatherData.currentObservation}
                    todayForecast={todayForecast}
                    tonightForecast={tonightForecast}
                    sunTimes={weatherData.sunTimes}
                  />
                </Suspense>

                {weatherData.hourlyForecast && weatherData.hourlyForecast.length > 0 && (
                  <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                    <HourlyForecast hourlyForecast={weatherData.hourlyForecast} />
                  </Suspense>
                )}

                <Suspense fallback={<Skeleton className="h-80 w-full" />}>
                  <RadarMap coordinates={weatherData.coordinates} />
                </Suspense>
              </div>

              {/* Right column: 7-Day Forecast */}
              {weatherData.forecast && weatherData.forecast.length > 0 && (
                <div className="lg:w-1/3">
                  <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
                    <SevenDayForecast forecast={weatherData.forecast} />
                  </Suspense>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer with theme and unit toggles */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-white/15 bg-white/5 dark:bg-black/15 backdrop-blur-sm" style={{ height: 'var(--footer-height)' }}>
        <div className="container mx-auto flex items-center justify-between px-4 h-full">
          <UnitToggle />
          <ThemeToggle />
        </div>
      </footer>
    </div>
  )
}

export default App