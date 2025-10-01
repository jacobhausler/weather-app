import { useState } from 'react'
import { Alert } from '@/types/weather'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'

interface AlertCardProps {
  alerts: Alert[]
}

const getSeverityConfig = (severity: Alert['severity']) => {
  switch (severity) {
    case 'Extreme':
      return {
        bgGradient: 'from-red-500/20 via-red-500/10 to-orange-500/20',
        borderColor: 'border-red-500/50',
        badgeClass: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-500/50',
        iconColor: 'text-red-600 dark:text-red-400',
        glowColor: 'from-red-500/30 to-orange-500/30',
        pulseColor: 'bg-red-500/20'
      }
    case 'Severe':
      return {
        bgGradient: 'from-orange-500/20 via-orange-500/10 to-amber-500/20',
        borderColor: 'border-orange-500/50',
        badgeClass: 'bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800 shadow-lg shadow-orange-500/50',
        iconColor: 'text-orange-600 dark:text-orange-400',
        glowColor: 'from-orange-500/30 to-amber-500/30',
        pulseColor: 'bg-orange-500/20'
      }
    case 'Moderate':
      return {
        bgGradient: 'from-yellow-500/20 via-yellow-500/10 to-amber-500/20',
        borderColor: 'border-yellow-500/50',
        badgeClass: 'bg-gradient-to-r from-yellow-600 to-amber-700 text-white hover:from-yellow-700 hover:to-amber-800 shadow-lg shadow-yellow-500/50',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        glowColor: 'from-yellow-500/30 to-amber-500/30',
        pulseColor: 'bg-yellow-500/20'
      }
    case 'Minor':
      return {
        bgGradient: 'from-blue-500/20 via-blue-500/10 to-cyan-500/20',
        borderColor: 'border-blue-500/50',
        badgeClass: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/50',
        iconColor: 'text-blue-600 dark:text-blue-400',
        glowColor: 'from-blue-500/30 to-cyan-500/30',
        pulseColor: 'bg-blue-500/20'
      }
    default:
      return {
        bgGradient: 'from-gray-500/20 via-gray-500/10 to-slate-500/20',
        borderColor: 'border-gray-500/50',
        badgeClass: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 shadow-lg shadow-gray-500/50',
        iconColor: 'text-gray-600 dark:text-gray-400',
        glowColor: 'from-gray-500/30 to-slate-500/30',
        pulseColor: 'bg-gray-500/20'
      }
  }
}

const getUrgencyConfig = (urgency: Alert['urgency']) => {
  switch (urgency) {
    case 'Immediate':
      return {
        badgeClass: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md',
        animate: true
      }
    case 'Expected':
      return {
        badgeClass: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md',
        animate: false
      }
    case 'Future':
      return {
        badgeClass: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md',
        animate: false
      }
    case 'Past':
      return {
        badgeClass: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 shadow-md',
        animate: false
      }
    default:
      return {
        badgeClass: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600 shadow-md',
        animate: false
      }
  }
}

const formatAlertTime = (dateString: string) => {
  try {
    return format(new Date(dateString), 'MMM d, h:mm a')
  } catch {
    return dateString
  }
}

const getAriaLive = (severity: Alert['severity']): 'assertive' | 'polite' => {
  return severity === 'Extreme' || severity === 'Severe' ? 'assertive' : 'polite'
}

function AlertItem({ alert }: { alert: Alert }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const severityConfig = getSeverityConfig(alert.severity)
  const urgencyConfig = getUrgencyConfig(alert.urgency)

  return (
    <Card
      className={`group/alert relative overflow-hidden border-[0.5px] ${severityConfig.borderColor} bg-gradient-to-br ${severityConfig.bgGradient} backdrop-blur-xl transition-all duration-500 hover:shadow-2xl`}
      role="alert"
      aria-live={getAriaLive(alert.severity)}
      aria-label={`${alert.severity} severity weather alert: ${alert.event}`}
    >
      {/* Animated background glow */}
      <div className={`absolute -inset-40 bg-gradient-to-r ${severityConfig.glowColor} opacity-0 blur-3xl transition-opacity duration-700 group-hover/alert:opacity-100`} />

      {/* Severity indicator pulse animation for extreme/severe */}
      {(alert.severity === 'Extreme' || alert.severity === 'Severe') && (
        <div className={`absolute left-0 top-0 h-full w-1 ${severityConfig.pulseColor} animate-pulse`} />
      )}

      <CardHeader className="relative pb-4">
        <div className="flex items-start gap-4">
          {/* Icon with glow effect */}
          <div className="relative">
            <div className={`absolute -inset-2 rounded-full bg-gradient-to-r ${severityConfig.glowColor} blur-lg ${urgencyConfig.animate ? 'animate-pulse' : ''}`} />
            <AlertTriangle
              className={`relative mt-1 h-7 w-7 flex-shrink-0 ${severityConfig.iconColor} drop-shadow-lg`}
              aria-hidden="true"
            />
          </div>

          {/* Header content */}
          <div className="flex-1 space-y-3">
            <h3 className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-xl font-bold leading-tight tracking-tight text-transparent">
              {alert.headline}
            </h3>

            <div className="flex flex-wrap gap-2">
              <Badge className={`${severityConfig.badgeClass} ${urgencyConfig.animate ? 'animate-pulse' : ''} border-0 px-3 py-1 text-xs font-bold uppercase tracking-wider`}>
                {alert.severity}
              </Badge>
              <Badge className={`${urgencyConfig.badgeClass} border-0 px-3 py-1 text-xs font-semibold uppercase tracking-wide`}>
                {alert.urgency}
              </Badge>
              <Badge className="border-[0.5px] border-border/50 bg-gradient-to-r from-muted/80 to-muted/60 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                {alert.event}
              </Badge>
            </div>
          </div>

          {/* Expand/Collapse button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`rounded-full p-2 transition-all duration-300 hover:bg-foreground/10 ${severityConfig.iconColor}`}
            aria-label={isExpanded ? 'Collapse alert details' : 'Expand alert details'}
            aria-expanded={isExpanded}
          >
            <ChevronDown
              className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </CardHeader>

      {/* Expandable content with smooth animation */}
      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <CardContent className="relative space-y-4 pt-0">
            {/* Time information */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-xl border-[0.5px] border-border/30 bg-gradient-to-r from-muted/50 to-muted/30 px-4 py-3 text-sm backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground/70">Effective:</span>
                <span className="font-medium text-foreground">{formatAlertTime(alert.onset)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground/70">Expires:</span>
                <span className="font-medium text-foreground">{formatAlertTime(alert.expires)}</span>
              </div>
            </div>

            {/* Description */}
            <div className="overflow-hidden rounded-xl border-[0.5px] border-border/30 bg-gradient-to-br from-card/60 to-card/40 p-5 backdrop-blur-sm">
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                {alert.description}
              </p>
            </div>

            {/* Area description */}
            {alert.areaDesc && (
              <div className="rounded-xl bg-gradient-to-r from-muted/40 to-muted/20 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground">
                  <strong className="font-semibold text-foreground/80">Affected Areas:</strong>{' '}
                  <span className="text-foreground/70">{alert.areaDesc}</span>
                </p>
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  )
}

export function AlertCard({ alerts }: AlertCardProps) {
  if (!alerts || alerts.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <AlertItem key={alert.id} alert={alert} />
      ))}
    </div>
  )
}
