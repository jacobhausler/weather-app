import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { ErrorBanner } from './components/ErrorBanner'
import { ThemeToggle } from './components/ThemeToggle'
import { UnitToggle } from './components/UnitToggle'
import { AlertCard } from './components/AlertCard'
import { SevenDayForecast } from './components/SevenDayForecast'
import { CurrentConditions } from './components/CurrentConditions'
import { HourlyForecast } from './components/HourlyForecast'
import { Skeleton } from './components/ui/skeleton'
import { CardContent, CardHeader } from './components/ui/card'
import { useWeatherData } from './hooks/useWeatherData'
import { useThemeStore } from './stores/themeStore'

function App() {
  const { weatherData, isLoading } = useWeatherData()
  const { theme } = useThemeStore()
  const [mounted, setMounted] = useState(false)
  const [cardsVisible, setCardsVisible] = useState(false)

  // Get today and tonight forecast periods
  const todayForecast = weatherData?.forecast.find((p) => p.isDaytime && p.number === 1)
  const tonightForecast = weatherData?.forecast.find((p) => !p.isDaytime && p.number === 2)

  // Mount animation
  useEffect(() => {
    setMounted(true)
  }, [])

  // Stagger card animations when data loads
  useEffect(() => {
    if (weatherData && !isLoading) {
      // Small delay before starting card animations
      const timer = setTimeout(() => {
        setCardsVisible(true)
      }, 150)
      return () => clearTimeout(timer)
    } else {
      setCardsVisible(false)
      return undefined
    }
  }, [weatherData, isLoading])

  // Determine effective theme for dynamic backgrounds
  const getEffectiveTheme = () => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme
  }

  const isDark = getEffectiveTheme() === 'dark'

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ paddingBottom: 'var(--footer-height)' }}
    >
      {/* Animated gradient background with noise texture */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Base gradient layer with smooth transitions */}
        <div
          className="absolute inset-0 transition-all duration-1000 ease-in-out"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, hsl(222, 47%, 8%) 0%, hsl(240, 45%, 10%) 25%, hsl(260, 40%, 12%) 50%, hsl(240, 45%, 10%) 75%, hsl(222, 47%, 8%) 100%)'
              : 'linear-gradient(135deg, hsl(200, 100%, 97%) 0%, hsl(220, 100%, 95%) 25%, hsl(240, 100%, 96%) 50%, hsl(220, 100%, 95%) 75%, hsl(200, 100%, 97%) 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 20s ease infinite'
          }}
        />

        {/* Animated accent orbs for depth */}
        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-30 transition-all duration-1000"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
            animation: 'float 25s ease-in-out infinite'
          }}
        />
        <div
          className="absolute top-1/3 right-0 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-30 transition-all duration-1000"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(96, 165, 250, 0.3) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)',
            animation: 'float 30s ease-in-out infinite reverse'
          }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-30 transition-all duration-1000"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, transparent 70%)',
            animation: 'float 28s ease-in-out infinite'
          }}
        />

        {/* Subtle noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}
        />
      </div>

      {/* Main content with smooth scroll */}
      <div className="relative" style={{ scrollBehavior: 'smooth' }}>
        <ErrorBanner />

        {/* Header with fade-in animation */}
        <div
          className={`transition-all duration-700 ease-out ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <Header />
        </div>

        <main className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Loading State with beautiful skeletons */}
          {isLoading && (
            <div className="space-y-6">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="glass-card rounded-2xl overflow-hidden transition-all duration-500 ease-out"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  <CardHeader className="space-y-3">
                    <Skeleton className="h-7 w-48 shimmer bg-white/10 dark:bg-white/5 rounded-lg" />
                    <Skeleton className="h-4 w-32 shimmer bg-white/10 dark:bg-white/5 rounded-lg" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <Skeleton className="h-32 w-full shimmer bg-white/10 dark:bg-white/5 rounded-xl" />
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-24 shimmer bg-white/10 dark:bg-white/5 rounded-xl" />
                        <Skeleton className="h-24 shimmer bg-white/10 dark:bg-white/5 rounded-xl" />
                      </div>
                    </div>
                  </CardContent>
                </div>
              ))}
            </div>
          )}

          {/* Empty State with elegant design */}
          {!isLoading && !weatherData && (
            <div
              className={`flex flex-col items-center justify-center py-20 px-4 transition-all duration-700 ease-out ${
                mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            >
              <div className="glass-card-strong rounded-3xl p-12 text-center space-y-4 max-w-2xl backdrop-blur-xl">
                {/* Weather icon decoration */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 blur-2xl opacity-50 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-pulse" />
                    <svg
                      className="relative w-24 h-24 text-blue-500 dark:text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                      />
                    </svg>
                  </div>
                </div>

                <h2 className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Welcome to HAUS Weather Station
                </h2>
                <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Enter a ZIP code above to view detailed weather information from the National Weather Service
                </p>

                {/* Subtle accent line */}
                <div className="flex justify-center pt-4">
                  <div className="w-24 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent rounded-full" />
                </div>
              </div>
            </div>
          )}

          {/* Weather Data with staggered card animations */}
          {!isLoading && weatherData && (
            <div className="space-y-6">
              {/* Alert Card - Conditionally rendered */}
              {weatherData.alerts && weatherData.alerts.length > 0 && (
                <div
                  className={`transition-all duration-700 ease-out ${
                    cardsVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: '0ms' }}
                >
                  <AlertCard alerts={weatherData.alerts} />
                </div>
              )}

              {/* 7-Day Forecast Card */}
              {weatherData.forecast && weatherData.forecast.length > 0 && (
                <div
                  className={`transition-all duration-700 ease-out ${
                    cardsVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{
                    transitionDelay: `${weatherData.alerts?.length > 0 ? 150 : 0}ms`
                  }}
                >
                  <SevenDayForecast forecast={weatherData.forecast} />
                </div>
              )}

              {/* Current Conditions + Daily Forecast Card */}
              <div
                className={`transition-all duration-700 ease-out ${
                  cardsVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: `${weatherData.alerts?.length > 0 ? 300 : 150}ms`
                }}
              >
                <CurrentConditions
                  observation={weatherData.currentObservation}
                  todayForecast={todayForecast}
                  tonightForecast={tonightForecast}
                  sunTimes={weatherData.sunTimes}
                />
              </div>

              {/* Hourly Forecast Card */}
              {weatherData.hourlyForecast && weatherData.hourlyForecast.length > 0 && (
                <div
                  className={`transition-all duration-700 ease-out ${
                    cardsVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{
                    transitionDelay: `${weatherData.alerts?.length > 0 ? 450 : 300}ms`
                  }}
                >
                  <HourlyForecast hourlyForecast={weatherData.hourlyForecast} />
                </div>
              )}
            </div>
          )}
        </main>

        {/* Enhanced glassmorphism footer */}
        <footer
          className="fixed bottom-0 left-0 right-0 z-50 border-t-ultra-thin transition-all duration-500"
          style={{
            height: 'var(--footer-height)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            background: isDark
              ? 'linear-gradient(to top, rgba(0, 0, 0, 0.3), rgba(255, 255, 255, 0.02))'
              : 'linear-gradient(to top, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.1))',
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.05)',
            boxShadow: isDark
              ? '0 -4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
              : '0 -4px 24px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
          }}
        >
          {/* Subtle top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-[1px] opacity-50"
            style={{
              background: isDark
                ? 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5) 20%, rgba(59, 130, 246, 0.5) 50%, rgba(139, 92, 246, 0.5) 80%, transparent)'
                : 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3) 20%, rgba(168, 85, 247, 0.3) 50%, rgba(59, 130, 246, 0.3) 80%, transparent)'
            }}
          />

          <div className="container mx-auto h-full px-6">
            <div className="flex items-center justify-between h-full">
              {/* Unit toggle with enhanced styling */}
              <div
                className={`transition-all duration-700 ease-out ${
                  mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
              >
                <UnitToggle />
              </div>

              {/* Center decoration (optional subtle branding) */}
              <div className="hidden md:flex items-center gap-2 opacity-40 hover:opacity-60 transition-opacity duration-300">
                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                <span className="text-xs font-medium tracking-wider uppercase">
                  Weather Station
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" style={{ animationDelay: '1s' }} />
              </div>

              {/* Theme toggle with enhanced styling */}
              <div
                className={`transition-all duration-700 ease-out ${
                  mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}
              >
                <ThemeToggle />
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Global styles for animations */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .shimmer {
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.1) 20%,
            rgba(255, 255, 255, 0.2) 40%,
            rgba(255, 255, 255, 0.1) 60%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite linear;
        }

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }

        /* Ensure theme transitions are smooth */
        .light,
        .dark {
          transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
        }

        /* Enhanced card hover effects */
        .glass-card,
        .glass-card-strong,
        .glass-card-subtle {
          will-change: transform;
        }

        /* Optimize animations for performance */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  )
}

export default App
