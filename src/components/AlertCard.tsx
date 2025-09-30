import { Alert } from '@/types/weather'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'

interface AlertCardProps {
  alerts: Alert[]
}

const getSeverityColor = (severity: Alert['severity']) => {
  switch (severity) {
    case 'Extreme':
      return 'bg-red-600 text-white hover:bg-red-700'
    case 'Severe':
      return 'bg-orange-600 text-white hover:bg-orange-700'
    case 'Moderate':
      return 'bg-yellow-600 text-white hover:bg-yellow-700'
    case 'Minor':
      return 'bg-blue-600 text-white hover:bg-blue-700'
    default:
      return 'bg-gray-600 text-white hover:bg-gray-700'
  }
}

const getUrgencyColor = (urgency: Alert['urgency']) => {
  switch (urgency) {
    case 'Immediate':
      return 'bg-red-500 text-white hover:bg-red-600'
    case 'Expected':
      return 'bg-orange-500 text-white hover:bg-orange-600'
    case 'Future':
      return 'bg-blue-500 text-white hover:bg-blue-600'
    case 'Past':
      return 'bg-gray-500 text-white hover:bg-gray-600'
    default:
      return 'bg-gray-400 text-white hover:bg-gray-500'
  }
}

const formatAlertTime = (dateString: string) => {
  try {
    return format(new Date(dateString), 'MMM d, h:mm a')
  } catch {
    return dateString
  }
}

export function AlertCard({ alerts }: AlertCardProps) {
  if (!alerts || alerts.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <Card
          key={alert.id}
          className="border-l-4 border-l-red-600 dark:border-l-red-400"
        >
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400" />
              <div className="flex-1 space-y-2">
                <CardTitle className="text-xl">{alert.headline}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                  <Badge className={getUrgencyColor(alert.urgency)}>
                    {alert.urgency}
                  </Badge>
                  <Badge variant="outline">{alert.event}</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span>
                  <strong>Effective:</strong> {formatAlertTime(alert.onset)}
                </span>
                <span>
                  <strong>Expires:</strong> {formatAlertTime(alert.expires)}
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {alert.description}
            </p>
            {alert.areaDesc && (
              <p className="text-xs text-muted-foreground">
                <strong>Areas:</strong> {alert.areaDesc}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}