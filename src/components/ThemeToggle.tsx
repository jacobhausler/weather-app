import { useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement

    // Remove both classes first
    root.classList.remove('light', 'dark')

    // Determine effective theme
    let effectiveTheme = theme
    if (theme === 'system') {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches
      effectiveTheme = prefersDark ? 'dark' : 'light'
    }

    // Apply theme
    root.classList.add(effectiveTheme)
  }, [theme])

  useEffect(() => {
    // Listen for system preference changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

      const handleChange = (e: MediaQueryListEvent) => {
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(e.matches ? 'dark' : 'light')
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    return undefined
  }, [theme])

  const toggleTheme = () => {
    const root = document.documentElement
    const currentTheme = root.classList.contains('dark') ? 'dark' : 'light'
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  // Determine effective theme from state, not DOM
  const getEffectiveTheme = () => {
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
      return prefersDark ? 'dark' : 'light'
    }
    return theme
  }

  const isDark = getEffectiveTheme() === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="group relative h-12 w-12 rounded-full overflow-hidden
                 backdrop-blur-xl bg-white/10 dark:bg-black/10
                 border border-white/20 dark:border-white/10
                 shadow-lg shadow-black/5 dark:shadow-black/20
                 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30
                 hover:scale-105 active:scale-95
                 transition-all duration-300 ease-out
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                 focus-visible:ring-offset-background"
      style={{
        backgroundImage: isDark
          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))'
          : 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(249, 115, 22, 0.1))'
      }}
    >
      {/* Animated background glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: isDark
            ? 'radial-gradient(circle at center, rgba(139, 92, 246, 0.2), transparent 70%)'
            : 'radial-gradient(circle at center, rgba(251, 191, 36, 0.2), transparent 70%)'
        }}
      />

      {/* Icons container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Sun icon */}
        <div
          className={`absolute inset-0 flex items-center justify-center
                     transition-all duration-500 ease-out
                     ${isDark
                       ? 'opacity-0 rotate-90 scale-0'
                       : 'opacity-100 rotate-0 scale-100'}`}
        >
          <Sun
            className="h-5 w-5 text-amber-500 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]
                       group-hover:drop-shadow-[0_0_12px_rgba(251,191,36,0.7)]
                       transition-all duration-300"
            strokeWidth={2.5}
          />
        </div>

        {/* Moon icon */}
        <div
          className={`absolute inset-0 flex items-center justify-center
                     transition-all duration-500 ease-out
                     ${isDark
                       ? 'opacity-100 rotate-0 scale-100'
                       : 'opacity-0 -rotate-90 scale-0'}`}
        >
          <Moon
            className="h-5 w-5 text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]
                       group-hover:drop-shadow-[0_0_12px_rgba(139,92,246,0.7)]
                       transition-all duration-300"
            strokeWidth={2.5}
          />
        </div>
      </div>

      {/* Ripple effect on click */}
      <div className="absolute inset-0 rounded-full
                     group-active:bg-white/20 dark:group-active:bg-white/10
                     transition-colors duration-150" />
    </button>
  )
}
