import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderHook, act } from '@testing-library/react'
import { ThemeToggle } from './ThemeToggle'
import { useThemeStore } from '@/stores/themeStore'

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()

    // Reset store to initial state
    const { result } = renderHook(() => useThemeStore())
    act(() => {
      result.current.setTheme('system')
    })

    // Clear document classes
    document.documentElement.classList.remove('light', 'dark')

    // Reset matchMedia mock
    vi.clearAllMocks()
  })

  describe('Initial Rendering', () => {
    it('should render the theme toggle button', () => {
      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should have proper ARIA label', () => {
      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label')
      expect(button.getAttribute('aria-label')).toMatch(/Switch to (light|dark) mode/)
    })

    it('should render with ghost variant and icon size', () => {
      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('rounded-full')
    })

    it('should render Moon icon when theme is light', () => {
      // Set system preference to light
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: false, // prefers-color-scheme: dark = false means light
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')
    })

    it('should render Sun icon when theme is dark', () => {
      // Set system preference to dark
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: true, // prefers-color-scheme: dark = true
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode')
    })
  })

  describe('Theme Switching', () => {
    it('should toggle from light to dark when clicked', async () => {
      const user = userEvent.setup()

      // Set initial theme to light
      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('light')
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')

      await user.click(button)

      await waitFor(() => {
        expect(result.current.theme).toBe('dark')
      })
    })

    it('should toggle from dark to light when clicked', async () => {
      const user = userEvent.setup()

      // Set initial theme to dark
      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('dark')
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode')

      await user.click(button)

      await waitFor(() => {
        expect(result.current.theme).toBe('light')
      })
    })

    it('should toggle multiple times correctly', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('light')
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')

      // First click: light -> dark
      await user.click(button)
      await waitFor(() => {
        expect(result.current.theme).toBe('dark')
      })

      // Second click: dark -> light
      await user.click(button)
      await waitFor(() => {
        expect(result.current.theme).toBe('light')
      })

      // Third click: light -> dark
      await user.click(button)
      await waitFor(() => {
        expect(result.current.theme).toBe('dark')
      })
    })

    it('should persist theme changes to localStorage', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('light')
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      await user.click(button)

      await waitFor(() => {
        const stored = localStorage.getItem('theme-storage')
        expect(stored).toBeTruthy()

        const parsed = JSON.parse(stored!)
        expect(parsed.state.theme).toBe('dark')
      })
    })
  })

  describe('DOM Class Application', () => {
    it('should apply dark class to document element when theme is dark', async () => {
      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('dark')
      })

      render(<ThemeToggle />)

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true)
        expect(document.documentElement.classList.contains('light')).toBe(false)
      })
    })

    it('should apply light class to document element when theme is light', async () => {
      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('light')
      })

      render(<ThemeToggle />)

      await waitFor(() => {
        expect(document.documentElement.classList.contains('light')).toBe(true)
        expect(document.documentElement.classList.contains('dark')).toBe(false)
      })
    })

    it('should remove previous theme class before applying new one', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('light')
      })

      render(<ThemeToggle />)

      await waitFor(() => {
        expect(document.documentElement.classList.contains('light')).toBe(true)
      })

      const button = screen.getByRole('button')
      await user.click(button)

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true)
        expect(document.documentElement.classList.contains('light')).toBe(false)
      })
    })

    it('should update DOM classes immediately when theme changes', async () => {
      const { result } = renderHook(() => useThemeStore())

      render(<ThemeToggle />)

      act(() => {
        result.current.setTheme('dark')
      })

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true)
      })

      act(() => {
        result.current.setTheme('light')
      })

      await waitFor(() => {
        expect(document.documentElement.classList.contains('light')).toBe(true)
      })
    })
  })

  describe('System Theme Detection', () => {
    it('should detect system dark theme preference', async () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('system')
      })

      render(<ThemeToggle />)

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true)
      })
    })

    it('should detect system light theme preference', async () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('system')
      })

      render(<ThemeToggle />)

      await waitFor(() => {
        expect(document.documentElement.classList.contains('light')).toBe(true)
      })
    })

    it('should apply system preference when theme is set to system', async () => {
      const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
        matches: true, // System prefers dark
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: matchMediaMock,
      })

      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('system')
      })

      render(<ThemeToggle />)

      expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)')

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true)
      })
    })
  })

  describe('System Theme Change Listener', () => {
    it('should listen for system theme changes when theme is system', () => {
      const addEventListenerMock = vi.fn()
      const removeEventListenerMock = vi.fn()

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: addEventListenerMock,
          removeEventListener: removeEventListenerMock,
          dispatchEvent: vi.fn(),
        })),
      })

      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('system')
      })

      const { unmount } = render(<ThemeToggle />)

      expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))

      unmount()

      expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('should not add listener when theme is not system', () => {
      const addEventListenerMock = vi.fn()

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: addEventListenerMock,
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('light')
      })

      render(<ThemeToggle />)

      // Should not add listener for system preference changes when explicit theme is set
      expect(addEventListenerMock).not.toHaveBeenCalled()
    })

    it('should respond to system theme changes when using system theme', async () => {
      let changeHandler: ((e: MediaQueryListEvent) => void) | null = null

      const addEventListenerMock = vi.fn((event: string, handler: any) => {
        if (event === 'change') {
          changeHandler = handler
        }
      })

      const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: addEventListenerMock,
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: matchMediaMock,
      })

      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('system')
      })

      render(<ThemeToggle />)

      await waitFor(() => {
        expect(changeHandler).not.toBeNull()
      })

      // Simulate system theme change to dark
      if (changeHandler) {
        act(() => {
          changeHandler({ matches: true } as MediaQueryListEvent)
        })
      }

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true)
        expect(document.documentElement.classList.contains('light')).toBe(false)
      })
    })

    it('should clean up event listener on unmount', () => {
      const addEventListenerMock = vi.fn()
      const removeEventListenerMock = vi.fn()

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: addEventListenerMock,
          removeEventListener: removeEventListenerMock,
          dispatchEvent: vi.fn(),
        })),
      })

      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('system')
      })

      const { unmount } = render(<ThemeToggle />)

      expect(addEventListenerMock).toHaveBeenCalled()

      unmount()

      expect(removeEventListenerMock).toHaveBeenCalled()
    })

    it('should update listener when theme changes from system to explicit', async () => {
      const removeEventListenerMock = vi.fn()

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: removeEventListenerMock,
          dispatchEvent: vi.fn(),
        })),
      })

      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('system')
      })

      render(<ThemeToggle />)

      // Change from system to explicit theme
      act(() => {
        result.current.setTheme('light')
      })

      await waitFor(() => {
        expect(removeEventListenerMock).toHaveBeenCalled()
      })
    })
  })

  describe('Store Integration', () => {
    it('should use theme from store', () => {
      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('dark')
      })

      render(<ThemeToggle />)

      expect(result.current.theme).toBe('dark')
    })

    it('should update store when toggling', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('light')
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      await user.click(button)

      await waitFor(() => {
        expect(result.current.theme).toBe('dark')
      })
    })

    it('should share state across multiple components', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('light')
      })

      const { rerender } = render(<ThemeToggle />)

      const button = screen.getByRole('button')
      await user.click(button)

      rerender(<ThemeToggle />)

      await waitFor(() => {
        expect(result.current.theme).toBe('dark')
      })
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('light')
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')

      // Tab to button
      await user.tab()
      expect(button).toHaveFocus()

      // Press Enter
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(result.current.theme).toBe('dark')
      })
    })

    it('should be activatable with Space key', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('light')
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')

      await user.tab()
      await user.keyboard(' ')

      await waitFor(() => {
        expect(result.current.theme).toBe('dark')
      })
    })

    it('should have descriptive aria-label that reflects current state', () => {
      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('dark')
      })

      const { rerender } = render(<ThemeToggle />)

      let button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode')

      act(() => {
        result.current.setTheme('light')
      })

      rerender(<ThemeToggle />)

      button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')
    })

    it('should maintain focus after theme toggle', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('light')
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')

      await user.tab()
      expect(button).toHaveFocus()

      await user.click(button)

      await waitFor(() => {
        expect(button).toHaveFocus()
      })
    })

    it('should have button role', () => {
      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid consecutive clicks', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('light')
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')

      // Click multiple times rapidly
      await user.click(button)
      await user.click(button)
      await user.click(button)

      // Should end up on dark (3 clicks from light = dark)
      await waitFor(() => {
        expect(result.current.theme).toBe('dark')
      })
    })

    it('should handle theme changes from external sources', async () => {
      const { result } = renderHook(() => useThemeStore())

      const { rerender } = render(<ThemeToggle />)

      act(() => {
        result.current.setTheme('light')
      })

      await waitFor(() => {
        expect(document.documentElement.classList.contains('light')).toBe(true)
      })

      // External change
      act(() => {
        result.current.setTheme('dark')
      })

      rerender(<ThemeToggle />)

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true)
      })
    })

    it('should handle matchMedia returning null matches', async () => {
      // Test with matchMedia that returns null or undefined
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('light')
      })

      // Should still render without crashing
      expect(() => render(<ThemeToggle />)).not.toThrow()
    })

    it('should apply correct theme immediately on mount', () => {
      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('dark')
      })

      render(<ThemeToggle />)

      // Theme should be applied synchronously
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should handle theme persistence across remounts', async () => {
      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('dark')
      })

      const { unmount } = render(<ThemeToggle />)

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true)
      })

      unmount()

      // Remount
      render(<ThemeToggle />)

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true)
        expect(result.current.theme).toBe('dark')
      })
    })
  })

  describe('Visual State', () => {
    it('should display correct icon for light theme', () => {
      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('light')
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')
    })

    it('should display correct icon for dark theme', () => {
      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('dark')
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode')
    })

    it('should update icon when theme changes', async () => {
      const { result } = renderHook(() => useThemeStore())
      act(() => {
        result.current.setTheme('light')
      })

      const { rerender } = render(<ThemeToggle />)

      let button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')

      act(() => {
        result.current.setTheme('dark')
      })

      rerender(<ThemeToggle />)

      button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode')
    })
  })

  describe('Integration with Theme Store', () => {
    it('should read initial theme from store', () => {
      const { result } = renderHook(() => useThemeStore())

      // Store starts with 'system' by default
      render(<ThemeToggle />)

      expect(result.current.theme).toBe('system')
    })

    it('should update when store theme changes externally', async () => {
      const { result } = renderHook(() => useThemeStore())

      const { rerender } = render(<ThemeToggle />)

      act(() => {
        result.current.setTheme('dark')
      })

      rerender(<ThemeToggle />)

      await waitFor(() => {
        const button = screen.getByRole('button')
        expect(button).toHaveAttribute('aria-label', 'Switch to light mode')
      })
    })

    it('should maintain consistency between store and DOM', async () => {
      const { result } = renderHook(() => useThemeStore())

      render(<ThemeToggle />)

      act(() => {
        result.current.setTheme('light')
      })

      await waitFor(() => {
        expect(result.current.theme).toBe('light')
        expect(document.documentElement.classList.contains('light')).toBe(true)
      })

      act(() => {
        result.current.setTheme('dark')
      })

      await waitFor(() => {
        expect(result.current.theme).toBe('dark')
        expect(document.documentElement.classList.contains('dark')).toBe(true)
      })
    })
  })
})
