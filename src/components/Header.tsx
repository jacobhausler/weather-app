import { RefreshButton } from './RefreshButton'
import { ZipInput } from './ZipInput'
import { useWeatherStore } from '../stores/weatherStore'

export function Header() {
  const { currentZipCode, weatherData } = useWeatherStore()

  // Display ZIP code in title only when weather data is loaded
  const displayTitle = weatherData && currentZipCode
    ? `HAUS Weather - ${currentZipCode}`
    : 'HAUS Weather Station'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/20 dark:border-white/10 bg-white/10 dark:bg-black/20 backdrop-blur-md shadow-glass">
      <div className="container mx-auto px-4 py-4">
        {/* Mobile Layout - Only visible on screens smaller than md (768px) */}
        <div className="md:hidden">
          <div className="flex flex-col gap-4">
            {/* Title row with refresh button */}
            <div className="flex items-center gap-2">
              <RefreshButton />
              <h1 className="flex-1 text-center text-2xl font-bold">
                {displayTitle}
              </h1>
            </div>

            {/* ZIP input */}
            <ZipInput />
          </div>
        </div>

        {/* Desktop Layout - Only visible on md screens and above (768px+) */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Refresh button */}
            <div className="flex items-center">
              <RefreshButton />
            </div>

            {/* Center: Title */}
            <h1 className="text-3xl font-bold">{displayTitle}</h1>

            {/* Right: ZIP input */}
            <div className="min-w-[280px]">
              <ZipInput />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}