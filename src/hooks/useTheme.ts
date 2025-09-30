import { useEffect } from 'react'
import { useThemeStore } from '../stores/themeStore'

type Theme = 'light' | 'dark' | 'system'

// Get the actual theme to apply (resolves 'system' to 'light' or 'dark')
function getResolvedTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    // Check system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light' // Default fallback
  }
  return theme
}

export function useTheme() {
  const { theme, setTheme } = useThemeStore()

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    const resolvedTheme = getResolvedTheme(theme)

    // Remove both classes first
    root.classList.remove('light', 'dark')

    // Add the resolved theme class
    root.classList.add(resolvedTheme)

    // Update color-scheme for native browser elements
    root.style.colorScheme = resolvedTheme
  }, [theme])

  // Listen for system theme changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') {
      return undefined
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      const root = document.documentElement
      const newTheme = e.matches ? 'dark' : 'light'

      root.classList.remove('light', 'dark')
      root.classList.add(newTheme)
      root.style.colorScheme = newTheme
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
    return undefined
  }, [theme])

  // Toggle between light and dark (cycles through light -> dark -> system)
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  // Get the currently applied theme (resolves 'system')
  const resolvedTheme = getResolvedTheme(theme)

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme
  }
}