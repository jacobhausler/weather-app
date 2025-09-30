import { useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

  const isDark = document.documentElement.classList.contains('dark')

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="rounded-full"
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  )
}