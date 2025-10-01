import { useEffect, useState } from 'react'
import { RefreshButton } from './RefreshButton'
import { ZipInput } from './ZipInput'

export function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`
        sticky top-0 z-40 w-full
        transition-all duration-500 ease-out
        ${
          scrolled
            ? 'bg-background/70 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20'
            : 'bg-background/40 backdrop-blur-lg'
        }
      `}
      style={{
        borderBottom: scrolled
          ? '1px solid hsl(var(--border) / 0.5)'
          : '1px solid transparent',
        backgroundImage: scrolled
          ? 'linear-gradient(to bottom, hsl(var(--background) / 0.7), hsl(var(--background) / 0.6))'
          : 'linear-gradient(to bottom, hsl(var(--background) / 0.4), hsl(var(--background) / 0.3))'
      }}
    >
      <div className="container mx-auto px-4 py-5 transition-all duration-500">
        {/* Mobile Layout - Only visible on screens smaller than md (768px) */}
        <div className="md:hidden">
          <div className="flex flex-col gap-5">
            {/* Title row with refresh button */}
            <div className="flex items-center gap-3">
              <RefreshButton />
              <h1 className="flex-1 text-center text-2xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text tracking-tight">
                HAUS Weather Station
              </h1>
            </div>

            {/* ZIP input */}
            <ZipInput />
          </div>
        </div>

        {/* Desktop Layout - Only visible on md screens and above (768px+) */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Refresh button */}
            <div className="flex items-center min-w-[48px]">
              <RefreshButton />
            </div>

            {/* Center: Title with modern typography */}
            <h1
              className="text-3xl lg:text-4xl font-bold tracking-tight transition-all duration-500"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, hsl(var(--foreground)), hsl(var(--foreground) / 0.8))',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em'
              }}
            >
              HAUS Weather Station
            </h1>

            {/* Right: ZIP input */}
            <div className="min-w-[320px]">
              <ZipInput />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient border */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-60 transition-opacity duration-500"
        style={{
          background: scrolled
            ? 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.4) 50%, transparent)'
            : 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.2) 50%, transparent)'
        }}
      />
    </header>
  )
}
