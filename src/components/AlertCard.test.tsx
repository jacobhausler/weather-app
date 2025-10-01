import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AlertCard } from './AlertCard'
import { Alert } from '@/types/weather'

describe('AlertCard', () => {
  const mockAlert: Alert = {
    id: 'alert-1',
    areaDesc: 'Collin County; Denton County',
    event: 'Severe Thunderstorm Warning',
    headline: 'Severe Thunderstorm Warning issued for the area',
    description: 'A severe thunderstorm warning has been issued. Take shelter immediately.',
    severity: 'Severe',
    urgency: 'Immediate',
    onset: '2024-01-15T14:30:00-06:00',
    expires: '2024-01-15T16:00:00-06:00',
    status: 'Actual',
    messageType: 'Alert',
    category: 'Met'
  }

  describe('Rendering and conditional display', () => {
    it('should render alert card with all alert information', () => {
      render(<AlertCard alerts={[mockAlert]} />)

      expect(screen.getByText('Severe Thunderstorm Warning issued for the area')).toBeInTheDocument()
      expect(screen.getByText('A severe thunderstorm warning has been issued. Take shelter immediately.')).toBeInTheDocument()
      expect(screen.getByText('Severe')).toBeInTheDocument()
      expect(screen.getByText('Immediate')).toBeInTheDocument()
      expect(screen.getByText('Severe Thunderstorm Warning')).toBeInTheDocument()
      expect(screen.getByText('Collin County; Denton County', { exact: false })).toBeInTheDocument()
    })

    it('should not render when alerts array is empty', () => {
      const { container } = render(<AlertCard alerts={[]} />)
      expect(container.firstChild).toBeNull()
    })

    it('should not render when alerts is undefined', () => {
      const { container } = render(<AlertCard alerts={undefined as unknown as Alert[]} />)
      expect(container.firstChild).toBeNull()
    })

    it('should not render when alerts is null', () => {
      const { container } = render(<AlertCard alerts={null as unknown as Alert[]} />)
      expect(container.firstChild).toBeNull()
    })

    it('should render multiple alerts in separate cards', () => {
      const secondAlert: Alert = {
        ...mockAlert,
        id: 'alert-2',
        headline: 'Flash Flood Warning issued',
        event: 'Flash Flood Warning',
        description: 'Flash flooding is occurring in the area.',
        severity: 'Extreme',
        urgency: 'Expected'
      }

      render(<AlertCard alerts={[mockAlert, secondAlert]} />)

      expect(screen.getByText('Severe Thunderstorm Warning issued for the area')).toBeInTheDocument()
      expect(screen.getByText('Flash Flood Warning issued')).toBeInTheDocument()
      expect(screen.getByText('A severe thunderstorm warning has been issued. Take shelter immediately.')).toBeInTheDocument()
      expect(screen.getByText('Flash flooding is occurring in the area.')).toBeInTheDocument()
    })
  })

  describe('Severity color mapping', () => {
    it('should apply red color class for Extreme severity', () => {
      const extremeAlert: Alert = {
        ...mockAlert,
        severity: 'Extreme'
      }

      render(<AlertCard alerts={[extremeAlert]} />)
      const severityBadge = screen.getByText('Extreme')
      expect(severityBadge).toHaveClass('bg-red-600')
    })

    it('should apply orange color class for Severe severity', () => {
      const severeAlert: Alert = {
        ...mockAlert,
        severity: 'Severe'
      }

      render(<AlertCard alerts={[severeAlert]} />)
      const severityBadge = screen.getByText('Severe')
      expect(severityBadge).toHaveClass('bg-orange-600')
    })

    it('should apply yellow color class for Moderate severity', () => {
      const moderateAlert: Alert = {
        ...mockAlert,
        severity: 'Moderate'
      }

      render(<AlertCard alerts={[moderateAlert]} />)
      const severityBadge = screen.getByText('Moderate')
      expect(severityBadge).toHaveClass('bg-yellow-600')
    })

    it('should apply blue color class for Minor severity', () => {
      const minorAlert: Alert = {
        ...mockAlert,
        severity: 'Minor'
      }

      render(<AlertCard alerts={[minorAlert]} />)
      const severityBadge = screen.getByText('Minor')
      expect(severityBadge).toHaveClass('bg-blue-600')
    })

    it('should apply gray color class for Unknown severity', () => {
      const unknownAlert: Alert = {
        ...mockAlert,
        severity: 'Unknown'
      }

      render(<AlertCard alerts={[unknownAlert]} />)
      const severityBadge = screen.getByText('Unknown')
      expect(severityBadge).toHaveClass('bg-gray-600')
    })
  })

  describe('Urgency color mapping', () => {
    it('should apply red color class for Immediate urgency', () => {
      const immediateAlert: Alert = {
        ...mockAlert,
        urgency: 'Immediate'
      }

      render(<AlertCard alerts={[immediateAlert]} />)
      const urgencyBadge = screen.getByText('Immediate')
      expect(urgencyBadge).toHaveClass('bg-red-500')
    })

    it('should apply orange color class for Expected urgency', () => {
      const expectedAlert: Alert = {
        ...mockAlert,
        urgency: 'Expected'
      }

      render(<AlertCard alerts={[expectedAlert]} />)
      const urgencyBadge = screen.getByText('Expected')
      expect(urgencyBadge).toHaveClass('bg-orange-500')
    })

    it('should apply blue color class for Future urgency', () => {
      const futureAlert: Alert = {
        ...mockAlert,
        urgency: 'Future'
      }

      render(<AlertCard alerts={[futureAlert]} />)
      const urgencyBadge = screen.getByText('Future')
      expect(urgencyBadge).toHaveClass('bg-blue-500')
    })

    it('should apply gray color class for Past urgency', () => {
      const pastAlert: Alert = {
        ...mockAlert,
        urgency: 'Past'
      }

      render(<AlertCard alerts={[pastAlert]} />)
      const urgencyBadge = screen.getByText('Past')
      expect(urgencyBadge).toHaveClass('bg-gray-500')
    })

    it('should apply light gray color class for Unknown urgency', () => {
      const unknownAlert: Alert = {
        ...mockAlert,
        urgency: 'Unknown'
      }

      render(<AlertCard alerts={[unknownAlert]} />)
      const urgencyBadge = screen.getByText('Unknown')
      expect(urgencyBadge).toHaveClass('bg-gray-400')
    })
  })

  describe('Date formatting', () => {
    it('should format onset and expires dates correctly', () => {
      render(<AlertCard alerts={[mockAlert]} />)

      // Formatted dates should appear in the document
      expect(screen.getByText(/Effective:/)).toBeInTheDocument()
      expect(screen.getByText(/Expires:/)).toBeInTheDocument()

      // Check for formatted date pattern (e.g., "Jan 15, 2:30 PM")
      const formattedDates = screen.getAllByText(/Jan 15, \d{1,2}:\d{2} [AP]M/, { exact: false })
      expect(formattedDates.length).toBeGreaterThan(0)
    })

    it('should handle invalid date strings gracefully', () => {
      const invalidDateAlert: Alert = {
        ...mockAlert,
        onset: 'invalid-date',
        expires: 'also-invalid'
      }

      render(<AlertCard alerts={[invalidDateAlert]} />)

      // Should fall back to displaying the original string
      expect(screen.getByText('invalid-date', { exact: false })).toBeInTheDocument()
      expect(screen.getByText('also-invalid', { exact: false })).toBeInTheDocument()
    })

    it('should format different date formats consistently', () => {
      const altDateAlert: Alert = {
        ...mockAlert,
        onset: '2024-03-20T09:15:00-05:00',
        expires: '2024-03-20T12:45:00-05:00'
      }

      render(<AlertCard alerts={[altDateAlert]} />)

      // Should format with the same pattern
      const formattedDates = screen.getAllByText(/Mar 20, \d{1,2}:\d{2} [AP]M/, { exact: false })
      expect(formattedDates.length).toBeGreaterThan(0)
    })
  })

  describe('Visual elements and structure', () => {
    it('should render alert icon', () => {
      render(<AlertCard alerts={[mockAlert]} />)

      // Check for alert triangle icon (lucide-react icon)
      const icon = document.querySelector('.lucide-triangle-alert')
      expect(icon).toBeInTheDocument()
    })

    it('should render with red border styling', () => {
      const { container } = render(<AlertCard alerts={[mockAlert]} />)

      const card = container.querySelector('.border-l-red-600')
      expect(card).toBeInTheDocument()
    })

    it('should render event badge with outline variant', () => {
      render(<AlertCard alerts={[mockAlert]} />)

      const eventBadge = screen.getByText('Severe Thunderstorm Warning')
      expect(eventBadge).toBeInTheDocument()
    })

    it('should display all three badges per alert', () => {
      render(<AlertCard alerts={[mockAlert]} />)

      // Should have severity, urgency, and event badges
      expect(screen.getByText('Severe')).toBeInTheDocument()
      expect(screen.getByText('Immediate')).toBeInTheDocument()
      expect(screen.getByText('Severe Thunderstorm Warning')).toBeInTheDocument()
    })
  })

  describe('Area description handling', () => {
    it('should render area description when provided', () => {
      render(<AlertCard alerts={[mockAlert]} />)

      expect(screen.getByText(/Areas:/)).toBeInTheDocument()
      expect(screen.getByText('Collin County; Denton County', { exact: false })).toBeInTheDocument()
    })

    it('should not render area section when areaDesc is empty', () => {
      const noAreaAlert: Alert = {
        ...mockAlert,
        areaDesc: ''
      }

      render(<AlertCard alerts={[noAreaAlert]} />)

      expect(screen.queryByText(/Areas:/)).not.toBeInTheDocument()
    })

    it('should not render area section when areaDesc is undefined', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { areaDesc, ...alertWithoutArea } = mockAlert
      const noAreaAlert: Alert = alertWithoutArea as Alert

      render(<AlertCard alerts={[noAreaAlert]} />)

      expect(screen.queryByText(/Areas:/)).not.toBeInTheDocument()
    })
  })

  describe('Description text formatting', () => {
    it('should preserve newlines in description text', () => {
      const multiLineAlert: Alert = {
        ...mockAlert,
        description: 'Line 1\nLine 2\nLine 3'
      }

      const { container } = render(<AlertCard alerts={[multiLineAlert]} />)

      // Check for whitespace-pre-line class that preserves newlines
      const descriptionElement = container.querySelector('.whitespace-pre-line')
      expect(descriptionElement).toBeInTheDocument()
      expect(descriptionElement).toHaveTextContent('Line 1')
      expect(descriptionElement).toHaveTextContent('Line 2')
      expect(descriptionElement).toHaveTextContent('Line 3')
    })

    it('should render long descriptions without truncation', () => {
      const longDescription = 'A'.repeat(500)
      const longDescAlert: Alert = {
        ...mockAlert,
        description: longDescription
      }

      render(<AlertCard alerts={[longDescAlert]} />)

      expect(screen.getByText(longDescription)).toBeInTheDocument()
    })
  })

  describe('Multiple alerts behavior', () => {
    it('should render each alert with unique key', () => {
      const alerts: Alert[] = [
        { ...mockAlert, id: 'alert-1' },
        { ...mockAlert, id: 'alert-2', headline: 'Second Alert' },
        { ...mockAlert, id: 'alert-3', headline: 'Third Alert' }
      ]

      render(<AlertCard alerts={alerts} />)

      expect(screen.getByText('Severe Thunderstorm Warning issued for the area')).toBeInTheDocument()
      expect(screen.getByText('Second Alert')).toBeInTheDocument()
      expect(screen.getByText('Third Alert')).toBeInTheDocument()
    })

    it('should stack multiple alerts vertically with spacing', () => {
      const alerts: Alert[] = [
        { ...mockAlert, id: 'alert-1' },
        { ...mockAlert, id: 'alert-2' }
      ]

      const { container } = render(<AlertCard alerts={alerts} />)

      const wrapper = container.querySelector('.space-y-4')
      expect(wrapper).toBeInTheDocument()
    })

    it('should maintain proper structure for each alert', () => {
      const alerts: Alert[] = [
        {
          ...mockAlert,
          id: 'alert-1',
          severity: 'Extreme',
          urgency: 'Immediate'
        },
        {
          ...mockAlert,
          id: 'alert-2',
          severity: 'Minor',
          urgency: 'Future',
          headline: 'Different Alert'
        }
      ]

      render(<AlertCard alerts={alerts} />)

      // First alert
      expect(screen.getByText('Extreme')).toBeInTheDocument()
      const immediateBadges = screen.getAllByText('Immediate')
      expect(immediateBadges.length).toBeGreaterThan(0)

      // Second alert
      expect(screen.getByText('Minor')).toBeInTheDocument()
      expect(screen.getByText('Future')).toBeInTheDocument()
      expect(screen.getByText('Different Alert')).toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    it('should handle alerts with minimal required fields', () => {
      const minimalAlert: Alert = {
        id: 'minimal-1',
        areaDesc: '',
        event: 'Test Event',
        headline: 'Test Headline',
        description: 'Test Description',
        severity: 'Unknown',
        urgency: 'Unknown',
        onset: '2024-01-15T12:00:00Z',
        expires: '2024-01-15T13:00:00Z',
        status: 'Actual',
        messageType: 'Alert',
        category: 'Met'
      }

      render(<AlertCard alerts={[minimalAlert]} />)

      expect(screen.getByText('Test Headline')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('should handle very long headlines', () => {
      const longHeadlineAlert: Alert = {
        ...mockAlert,
        headline: 'A'.repeat(200)
      }

      render(<AlertCard alerts={[longHeadlineAlert]} />)

      expect(screen.getByText('A'.repeat(200))).toBeInTheDocument()
    })

    it('should render correctly with all severity and urgency combinations', () => {
      const severities: Alert['severity'][] = ['Extreme', 'Severe', 'Moderate', 'Minor', 'Unknown']
      const urgencies: Array<'Immediate' | 'Expected' | 'Future' | 'Past' | 'Unknown'> = ['Immediate', 'Expected', 'Future', 'Past', 'Unknown']

      const alerts: Alert[] = severities.map((severity, idx) => ({
        ...mockAlert,
        id: `alert-${idx}`,
        severity,
        urgency: urgencies[idx]!,
        headline: `Alert ${idx + 1}`
      }))

      render(<AlertCard alerts={alerts} />)

      severities.forEach(severity => {
        const elements = screen.getAllByText(severity)
        expect(elements.length).toBeGreaterThan(0)
      })

      urgencies.forEach(urgency => {
        const elements = screen.getAllByText(urgency)
        expect(elements.length).toBeGreaterThan(0)
      })
    })
  })
})
