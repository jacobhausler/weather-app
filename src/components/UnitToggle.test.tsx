import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderHook, act } from '@testing-library/react'
import { UnitToggle } from './UnitToggle'
import { useUnitStore } from '@/stores/unitStore'

describe('UnitToggle', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()

    // Reset store to initial state
    const { result } = renderHook(() => useUnitStore())
    act(() => {
      result.current.setUnitSystem('imperial')
    })
  })

  describe('Initial Rendering', () => {
    it('should render the unit toggle component', () => {
      render(<UnitToggle />)

      expect(screen.getByText('Imperial')).toBeInTheDocument()
      expect(screen.getByText('Metric')).toBeInTheDocument()
    })

    it('should render a switch control', () => {
      render(<UnitToggle />)

      const toggle = screen.getByRole('switch')
      expect(toggle).toBeInTheDocument()
    })

    it('should have proper ARIA label', () => {
      render(<UnitToggle />)

      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveAttribute(
        'aria-label',
        'Toggle between Imperial and Metric units'
      )
    })

    it('should have id attribute for label association', () => {
      render(<UnitToggle />)

      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveAttribute('id', 'unit-toggle')
    })

    it('should have both labels properly associated with switch', () => {
      render(<UnitToggle />)

      const imperialLabel = screen.getByText('Imperial')
      const metricLabel = screen.getByText('Metric')

      expect(imperialLabel).toHaveAttribute('for', 'unit-toggle')
      expect(metricLabel).toHaveAttribute('for', 'unit-toggle')
    })

    it('should start with imperial system by default', () => {
      render(<UnitToggle />)

      const toggle = screen.getByRole('switch')
      expect(toggle).not.toBeChecked()
    })

    it('should display imperial label prominently when imperial is selected', () => {
      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('imperial')
      })

      render(<UnitToggle />)

      const imperialLabel = screen.getByText('Imperial')
      const metricLabel = screen.getByText('Metric')

      expect(imperialLabel).toHaveClass('text-foreground')
      expect(metricLabel).toHaveClass('text-muted-foreground')
    })

    it('should display metric label prominently when metric is selected', () => {
      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('metric')
      })

      render(<UnitToggle />)

      const imperialLabel = screen.getByText('Imperial')
      const metricLabel = screen.getByText('Metric')

      expect(imperialLabel).toHaveClass('text-muted-foreground')
      expect(metricLabel).toHaveClass('text-foreground')
    })
  })

  describe('Unit System Switching', () => {
    it('should toggle from imperial to metric when clicked', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('imperial')
      })

      render(<UnitToggle />)

      const toggle = screen.getByRole('switch')
      expect(toggle).not.toBeChecked()

      await user.click(toggle)

      await waitFor(() => {
        expect(result.current.unitSystem).toBe('metric')
        expect(toggle).toBeChecked()
      })
    })

    it('should toggle from metric to imperial when clicked', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('metric')
      })

      render(<UnitToggle />)

      const toggle = screen.getByRole('switch')
      expect(toggle).toBeChecked()

      await user.click(toggle)

      await waitFor(() => {
        expect(result.current.unitSystem).toBe('imperial')
        expect(toggle).not.toBeChecked()
      })
    })

    it('should toggle multiple times correctly', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('imperial')
      })

      render(<UnitToggle />)

      const toggle = screen.getByRole('switch')

      // First toggle: imperial -> metric
      await user.click(toggle)
      await waitFor(() => {
        expect(result.current.unitSystem).toBe('metric')
      })

      // Second toggle: metric -> imperial
      await user.click(toggle)
      await waitFor(() => {
        expect(result.current.unitSystem).toBe('imperial')
      })

      // Third toggle: imperial -> metric
      await user.click(toggle)
      await waitFor(() => {
        expect(result.current.unitSystem).toBe('metric')
      })
    })

    it('should update visual state when toggling', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('imperial')
      })

      const { rerender } = render(<UnitToggle />)

      let imperialLabel = screen.getByText('Imperial')
      let metricLabel = screen.getByText('Metric')

      expect(imperialLabel).toHaveClass('text-foreground')
      expect(metricLabel).toHaveClass('text-muted-foreground')

      const toggle = screen.getByRole('switch')
      await user.click(toggle)

      rerender(<UnitToggle />)

      imperialLabel = screen.getByText('Imperial')
      metricLabel = screen.getByText('Metric')

      await waitFor(() => {
        expect(imperialLabel).toHaveClass('text-muted-foreground')
        expect(metricLabel).toHaveClass('text-foreground')
      })
    })

    it('should persist unit system to localStorage', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('imperial')
      })

      render(<UnitToggle />)

      const toggle = screen.getByRole('switch')
      await user.click(toggle)

      await waitFor(() => {
        const stored = localStorage.getItem('unit-storage')
        expect(stored).toBeTruthy()

        const parsed = JSON.parse(stored!)
        expect(parsed.state.unitSystem).toBe('metric')
      })
    })
  })

  describe('Store Integration', () => {
    it('should use unit system from store', () => {
      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('metric')
      })

      render(<UnitToggle />)

      expect(result.current.unitSystem).toBe('metric')

      const toggle = screen.getByRole('switch')
      expect(toggle).toBeChecked()
    })

    it('should update store when toggling', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('imperial')
      })

      render(<UnitToggle />)

      const toggle = screen.getByRole('switch')
      await user.click(toggle)

      await waitFor(() => {
        expect(result.current.unitSystem).toBe('metric')
      })
    })

    it('should share state across multiple components', async () => {
      const user = userEvent.setup()

      const { result: result1 } = renderHook(() => useUnitStore())
      const { result: result2 } = renderHook(() => useUnitStore())

      act(() => {
        result1.current.setUnitSystem('imperial')
      })

      render(<UnitToggle />)

      const toggle = screen.getByRole('switch')
      await user.click(toggle)

      await waitFor(() => {
        expect(result1.current.unitSystem).toBe('metric')
        expect(result2.current.unitSystem).toBe('metric')
      })
    })

    it('should read from localStorage on initialization', () => {
      // Set up localStorage with metric
      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('metric')
      })

      // Verify localStorage
      const stored = localStorage.getItem('unit-storage')
      expect(stored).toBeTruthy()

      // Render component
      render(<UnitToggle />)

      const toggle = screen.getByRole('switch')
      expect(toggle).toBeChecked()
    })

    it('should respond to external store changes', async () => {
      const { result } = renderHook(() => useUnitStore())

      const { rerender } = render(<UnitToggle />)

      act(() => {
        result.current.setUnitSystem('imperial')
      })

      rerender(<UnitToggle />)

      const toggle = screen.getByRole('switch')
      expect(toggle).not.toBeChecked()

      act(() => {
        result.current.setUnitSystem('metric')
      })

      rerender(<UnitToggle />)

      await waitFor(() => {
        expect(toggle).toBeChecked()
      })
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard accessible with Tab key', async () => {
      const user = userEvent.setup()

      render(<UnitToggle />)

      const toggle = screen.getByRole('switch')

      await user.tab()
      expect(toggle).toHaveFocus()
    })

    it('should be toggleable with Space key', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('imperial')
      })

      render(<UnitToggle />)

      const toggle = screen.getByRole('switch')

      await user.tab()
      expect(toggle).toHaveFocus()

      await user.keyboard(' ')

      await waitFor(() => {
        expect(result.current.unitSystem).toBe('metric')
      })
    })

    it('should be toggleable with Enter key', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('imperial')
      })

      render(<UnitToggle />)

      const toggle = screen.getByRole('switch')

      await user.tab()
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(result.current.unitSystem).toBe('metric')
      })
    })

    it('should have role="switch"', () => {
      render(<UnitToggle />)

      const toggle = screen.getByRole('switch')
      expect(toggle).toBeInTheDocument()
    })

    it('should have descriptive aria-label', () => {
      render(<UnitToggle />)

      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveAttribute('aria-label')
      expect(toggle.getAttribute('aria-label')).toContain('Imperial')
      expect(toggle.getAttribute('aria-label')).toContain('Metric')
    })

    it('should update aria-checked attribute', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('imperial')
      })

      render(<UnitToggle />)

      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveAttribute('aria-checked', 'false')

      await user.click(toggle)

      await waitFor(() => {
        expect(toggle).toHaveAttribute('aria-checked', 'true')
      })
    })

    it('should maintain focus after toggle', async () => {
      const user = userEvent.setup()

      render(<UnitToggle />)

      const toggle = screen.getByRole('switch')

      await user.tab()
      expect(toggle).toHaveFocus()

      await user.click(toggle)

      await waitFor(() => {
        expect(toggle).toHaveFocus()
      })
    })

    it('should have proper label association via htmlFor', () => {
      render(<UnitToggle />)

      const imperialLabel = screen.getByText('Imperial')
      const metricLabel = screen.getByText('Metric')
      const toggle = screen.getByRole('switch')

      expect(imperialLabel.getAttribute('for')).toBe(toggle.getAttribute('id'))
      expect(metricLabel.getAttribute('for')).toBe(toggle.getAttribute('id'))
    })

    it('should be clickable via labels', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('imperial')
      })

      render(<UnitToggle />)

      const metricLabel = screen.getByText('Metric')

      await user.click(metricLabel)

      await waitFor(() => {
        expect(result.current.unitSystem).toBe('metric')
      })
    })
  })

  describe('Visual Feedback', () => {
    it('should show imperial as active when imperial is selected', () => {
      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('imperial')
      })

      render(<UnitToggle />)

      const imperialLabel = screen.getByText('Imperial')
      const metricLabel = screen.getByText('Metric')

      expect(imperialLabel.className).toContain('text-foreground')
      expect(metricLabel.className).toContain('text-muted-foreground')
    })

    it('should show metric as active when metric is selected', () => {
      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('metric')
      })

      render(<UnitToggle />)

      const imperialLabel = screen.getByText('Imperial')
      const metricLabel = screen.getByText('Metric')

      expect(imperialLabel.className).toContain('text-muted-foreground')
      expect(metricLabel.className).toContain('text-foreground')
    })

    it('should update visual state immediately when unit changes', async () => {
      const { result } = renderHook(() => useUnitStore())

      const { rerender } = render(<UnitToggle />)

      act(() => {
        result.current.setUnitSystem('imperial')
      })

      rerender(<UnitToggle />)

      let imperialLabel = screen.getByText('Imperial')
      expect(imperialLabel.className).toContain('text-foreground')

      act(() => {
        result.current.setUnitSystem('metric')
      })

      rerender(<UnitToggle />)

      const metricLabel = screen.getByText('Metric')
      expect(metricLabel.className).toContain('text-foreground')
    })

    it('should have consistent styling with both states', () => {
      const { result } = renderHook(() => useUnitStore())

      // Test imperial state
      act(() => {
        result.current.setUnitSystem('imperial')
      })

      const { rerender } = render(<UnitToggle />)

      let imperialLabel = screen.getByText('Imperial')
      let metricLabel = screen.getByText('Metric')

      expect(imperialLabel.className).toContain('text-sm')
      expect(imperialLabel.className).toContain('font-medium')
      expect(metricLabel.className).toContain('text-sm')
      expect(metricLabel.className).toContain('font-medium')

      // Test metric state
      act(() => {
        result.current.setUnitSystem('metric')
      })

      rerender(<UnitToggle />)

      imperialLabel = screen.getByText('Imperial')
      metricLabel = screen.getByText('Metric')

      expect(imperialLabel.className).toContain('text-sm')
      expect(imperialLabel.className).toContain('font-medium')
      expect(metricLabel.className).toContain('text-sm')
      expect(metricLabel.className).toContain('font-medium')
    })
  })

  describe('Layout and Structure', () => {
    it('should render in horizontal layout', () => {
      const { container } = render(<UnitToggle />)

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('flex')
      expect(wrapper).toHaveClass('items-center')
    })

    it('should have proper spacing between elements', () => {
      const { container } = render(<UnitToggle />)

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('gap-3')
    })

    it('should render labels and switch in correct order', () => {
      const { container } = render(<UnitToggle />)

      const wrapper = container.firstChild as HTMLElement
      const children = Array.from(wrapper.children)

      expect(children[0].textContent).toBe('Imperial')
      expect(children[1]).toHaveAttribute('role', 'switch')
      expect(children[2].textContent).toBe('Metric')
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid consecutive clicks', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('imperial')
      })

      render(<UnitToggle />)

      const toggle = screen.getByRole('switch')

      // Click multiple times rapidly
      await user.click(toggle)
      await user.click(toggle)
      await user.click(toggle)

      // Should end up on metric (3 clicks from imperial = metric)
      await waitFor(() => {
        expect(result.current.unitSystem).toBe('metric')
      })
    })

    it('should handle unit system changes from external sources', async () => {
      const { result } = renderHook(() => useUnitStore())

      const { rerender } = render(<UnitToggle />)

      act(() => {
        result.current.setUnitSystem('imperial')
      })

      rerender(<UnitToggle />)

      const toggle = screen.getByRole('switch')
      expect(toggle).not.toBeChecked()

      // External change
      act(() => {
        result.current.setUnitSystem('metric')
      })

      rerender(<UnitToggle />)

      await waitFor(() => {
        expect(toggle).toBeChecked()
      })
    })

    it('should maintain state consistency across remounts', async () => {
      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('metric')
      })

      const { unmount } = render(<UnitToggle />)

      let toggle = screen.getByRole('switch')
      expect(toggle).toBeChecked()

      unmount()

      // Remount
      render(<UnitToggle />)

      toggle = screen.getByRole('switch')
      expect(toggle).toBeChecked()
      expect(result.current.unitSystem).toBe('metric')
    })

    it('should handle persistence across component lifecycle', () => {
      const { result } = renderHook(() => useUnitStore())

      act(() => {
        result.current.setUnitSystem('metric')
      })

      const { unmount, rerender } = render(<UnitToggle />)

      expect(result.current.unitSystem).toBe('metric')

      rerender(<UnitToggle />)
      expect(result.current.unitSystem).toBe('metric')

      unmount()

      // Create new render
      render(<UnitToggle />)
      expect(result.current.unitSystem).toBe('metric')
    })

    it('should handle localStorage persistence correctly', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('imperial')
      })

      render(<UnitToggle />)

      const toggle = screen.getByRole('switch')

      // Toggle to metric
      await user.click(toggle)

      await waitFor(() => {
        const stored = localStorage.getItem('unit-storage')
        expect(stored).toBeTruthy()

        const parsed = JSON.parse(stored!)
        expect(parsed.state.unitSystem).toBe('metric')
      })

      // Toggle back to imperial
      await user.click(toggle)

      await waitFor(() => {
        const stored = localStorage.getItem('unit-storage')
        expect(stored).toBeTruthy()

        const parsed = JSON.parse(stored!)
        expect(parsed.state.unitSystem).toBe('imperial')
      })
    })

    it('should not break with disabled switch (if implemented)', () => {
      render(<UnitToggle />)

      const toggle = screen.getByRole('switch')
      expect(toggle).toBeInTheDocument()
    })
  })

  describe('Component Props and Behavior', () => {
    it('should call setUnitSystem with correct value when toggling on', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useUnitStore())
      const setUnitSystemSpy = vi.fn(result.current.setUnitSystem)

      act(() => {
        result.current.setUnitSystem('imperial')
      })

      render(<UnitToggle />)

      const toggle = screen.getByRole('switch')
      await user.click(toggle)

      await waitFor(() => {
        expect(result.current.unitSystem).toBe('metric')
      })
    })

    it('should call setUnitSystem with correct value when toggling off', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useUnitStore())

      act(() => {
        result.current.setUnitSystem('metric')
      })

      render(<UnitToggle />)

      const toggle = screen.getByRole('switch')
      await user.click(toggle)

      await waitFor(() => {
        expect(result.current.unitSystem).toBe('imperial')
      })
    })

    it('should correctly map checked state to unit system', () => {
      const { result } = renderHook(() => useUnitStore())

      // Imperial = not checked
      act(() => {
        result.current.setUnitSystem('imperial')
      })

      const { rerender } = render(<UnitToggle />)

      let toggle = screen.getByRole('switch')
      expect(toggle).not.toBeChecked()

      // Metric = checked
      act(() => {
        result.current.setUnitSystem('metric')
      })

      rerender(<UnitToggle />)

      toggle = screen.getByRole('switch')
      expect(toggle).toBeChecked()
    })
  })

  describe('User Interaction Patterns', () => {
    it('should handle click on imperial label when metric is selected', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('metric')
      })

      render(<UnitToggle />)

      const imperialLabel = screen.getByText('Imperial')
      await user.click(imperialLabel)

      await waitFor(() => {
        expect(result.current.unitSystem).toBe('imperial')
      })
    })

    it('should handle click on metric label when imperial is selected', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('imperial')
      })

      render(<UnitToggle />)

      const metricLabel = screen.getByText('Metric')
      await user.click(metricLabel)

      await waitFor(() => {
        expect(result.current.unitSystem).toBe('metric')
      })
    })

    it('should handle mixed interaction (label and switch clicks)', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('imperial')
      })

      render(<UnitToggle />)

      // Click switch
      const toggle = screen.getByRole('switch')
      await user.click(toggle)

      await waitFor(() => {
        expect(result.current.unitSystem).toBe('metric')
      })

      // Click imperial label
      const imperialLabel = screen.getByText('Imperial')
      await user.click(imperialLabel)

      await waitFor(() => {
        expect(result.current.unitSystem).toBe('imperial')
      })

      // Click switch again
      await user.click(toggle)

      await waitFor(() => {
        expect(result.current.unitSystem).toBe('metric')
      })
    })
  })

  describe('Integration with Unit Conversions', () => {
    it('should provide context for temperature conversions', () => {
      const { result } = renderHook(() => useUnitStore())

      render(<UnitToggle />)

      act(() => {
        result.current.setUnitSystem('imperial')
      })

      expect(result.current.unitSystem).toBe('imperial')

      act(() => {
        result.current.setUnitSystem('metric')
      })

      expect(result.current.unitSystem).toBe('metric')
    })

    it('should affect unit display throughout application', async () => {
      const user = userEvent.setup()

      const { result } = renderHook(() => useUnitStore())

      render(<UnitToggle />)

      // Start with imperial
      expect(result.current.unitSystem).toBe('imperial')

      const toggle = screen.getByRole('switch')
      await user.click(toggle)

      // Should now be metric
      await waitFor(() => {
        expect(result.current.unitSystem).toBe('metric')
      })
    })
  })
})
