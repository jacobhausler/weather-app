import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function AlertCardSkeleton() {
  return (
    <Card className="border-l-4 border-l-red-600 dark:border-l-red-400">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Skeleton className="mt-1 h-6 w-6 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-3/4" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  )
}

export function SevenDayForecastSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-40" />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-2">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="flex min-w-[140px] flex-col items-center gap-2 rounded-lg border p-4"
              >
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-12" />
                  <Skeleton className="h-5 w-10" />
                </div>
                <div className="w-full space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function CurrentConditionsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Weather */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20" />
              <div className="space-y-2">
                <Skeleton className="h-14 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-4">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-2 rounded-lg border p-3">
                <Skeleton className="h-4 w-4" />
                <div className="min-w-0 flex-1 space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Forecast */}
        <div className="mt-6 rounded-lg bg-muted p-4 space-y-2">
          <Skeleton className="h-5 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>

        {/* Tonight's Forecast */}
        <div className="mt-4 rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function HourlyForecastSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-8 w-40" />

          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-[120px]" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full flex items-end justify-around gap-2 px-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-2 flex-1">
              <Skeleton
                className="w-full"
                style={{ height: `${Math.random() * 150 + 100}px` }}
              />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-4 flex justify-around rounded-lg bg-muted p-3">
          <div className="text-center space-y-1">
            <Skeleton className="h-4 w-12 mx-auto" />
            <Skeleton className="h-5 w-16 mx-auto" />
          </div>
          <div className="text-center space-y-1">
            <Skeleton className="h-4 w-12 mx-auto" />
            <Skeleton className="h-5 w-16 mx-auto" />
          </div>
          <div className="text-center space-y-1">
            <Skeleton className="h-4 w-12 mx-auto" />
            <Skeleton className="h-5 w-16 mx-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}