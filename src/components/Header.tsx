import { RefreshButton } from './RefreshButton'
import { ZipInput } from './ZipInput'

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        {/* Mobile Layout */}
        <div className="flex flex-col gap-4 md:hidden">
          {/* Title row with refresh button */}
          <div className="flex items-center gap-2">
            <RefreshButton />
            <h1 className="flex-1 text-center text-2xl font-bold">
              HAUS Weather Station
            </h1>
          </div>

          {/* ZIP input */}
          <ZipInput />
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:items-center md:justify-between md:gap-4">
          {/* Left: Refresh button */}
          <div className="flex items-center">
            <RefreshButton />
          </div>

          {/* Center: Title */}
          <h1 className="text-3xl font-bold">HAUS Weather Station</h1>

          {/* Right: ZIP input */}
          <div className="min-w-[280px]">
            <ZipInput />
          </div>
        </div>
      </div>
    </header>
  )
}