import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Enhanced Skeleton component with beautiful animations
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'shimmer' | 'pulse' | 'wave'
  speed?: 'slow' | 'normal' | 'fast'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
}

function AnimatedSkeleton({
  className,
  variant = 'shimmer',
  speed = 'normal',
  rounded = 'md',
  ...props
}: SkeletonProps) {
  const speedClass = {
    slow: 'animate-shimmer-slow',
    normal: 'animate-shimmer',
    fast: 'animate-shimmer-fast',
  }

  const variantClass = {
    default: 'bg-gradient-to-r from-muted via-muted to-muted',
    shimmer: 'bg-gradient-to-r from-muted/60 via-muted/90 to-muted/60 bg-[length:200%_100%]',
    pulse: 'bg-muted animate-pulse-gentle',
    wave: 'bg-gradient-to-r from-muted/40 via-muted/80 to-muted/40 bg-[length:300%_100%]',
  }

  const roundedClass = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        variantClass[variant],
        variant === 'shimmer' || variant === 'wave' ? speedClass[speed] : '',
        roundedClass[rounded],
        'backdrop-blur-sm',
        'transition-opacity duration-500 ease-out',
        className
      )}
      {...props}
    />
  )
}

// Staggered container for sequential animations
function StaggeredContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('space-y-2', className)}>{children}</div>
}

export function AlertCardSkeleton() {
  return (
    <Card className="border-l-4 border-l-red-600/50 dark:border-l-red-400/50 animate-fade-in glass-morphism">
      <CardHeader>
        <div className="flex items-start gap-3">
          <AnimatedSkeleton
            variant="shimmer"
            speed="normal"
            rounded="md"
            className="mt-1 h-6 w-6 flex-shrink-0"
            style={{ animationDelay: '0ms' }}
          />
          <div className="flex-1 space-y-2">
            <AnimatedSkeleton
              variant="shimmer"
              speed="normal"
              className="h-7 w-3/4"
              style={{ animationDelay: '100ms' }}
            />
            <div className="flex flex-wrap gap-2">
              <AnimatedSkeleton
                variant="wave"
                speed="fast"
                rounded="full"
                className="h-6 w-20"
                style={{ animationDelay: '200ms' }}
              />
              <AnimatedSkeleton
                variant="wave"
                speed="fast"
                rounded="full"
                className="h-6 w-24"
                style={{ animationDelay: '250ms' }}
              />
              <AnimatedSkeleton
                variant="wave"
                speed="fast"
                rounded="full"
                className="h-6 w-32"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <AnimatedSkeleton
            variant="pulse"
            className="h-4 w-48"
            style={{ animationDelay: '350ms' }}
          />
          <AnimatedSkeleton
            variant="pulse"
            className="h-4 w-48"
            style={{ animationDelay: '400ms' }}
          />
        </div>
        <StaggeredContainer className="space-y-2">
          <AnimatedSkeleton
            variant="shimmer"
            speed="slow"
            className="h-4 w-full"
            style={{ animationDelay: '450ms' }}
          />
          <AnimatedSkeleton
            variant="shimmer"
            speed="slow"
            className="h-4 w-full"
            style={{ animationDelay: '500ms' }}
          />
          <AnimatedSkeleton
            variant="shimmer"
            speed="slow"
            className="h-4 w-5/6"
            style={{ animationDelay: '550ms' }}
          />
        </StaggeredContainer>
        <AnimatedSkeleton
          variant="shimmer"
          className="h-4 w-3/4"
          style={{ animationDelay: '600ms' }}
        />
      </CardContent>
    </Card>
  )
}

export function SevenDayForecastSkeleton() {
  return (
    <Card className="animate-fade-in glass-morphism">
      <CardHeader>
        <AnimatedSkeleton variant="shimmer" speed="normal" className="h-8 w-40" />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-2">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  'flex min-w-[140px] flex-col items-center gap-2',
                  'rounded-lg border border-border/50 p-4',
                  'glass-morphism-card animate-scale-in',
                  'hover:shadow-lg transition-all duration-300'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <AnimatedSkeleton
                  variant="wave"
                  speed="fast"
                  className="h-5 w-20"
                  style={{ animationDelay: `${index * 100 + 50}ms` }}
                />
                <AnimatedSkeleton
                  variant="shimmer"
                  speed="normal"
                  rounded="full"
                  className="h-16 w-16 animate-pulse-scale"
                  style={{ animationDelay: `${index * 100 + 100}ms` }}
                />
                <AnimatedSkeleton
                  variant="pulse"
                  className="h-4 w-24"
                  style={{ animationDelay: `${index * 100 + 150}ms` }}
                />
                <div className="flex items-center gap-2">
                  <AnimatedSkeleton
                    variant="shimmer"
                    speed="fast"
                    className="h-7 w-12"
                    style={{ animationDelay: `${index * 100 + 200}ms` }}
                  />
                  <AnimatedSkeleton
                    variant="shimmer"
                    speed="fast"
                    className="h-5 w-10"
                    style={{ animationDelay: `${index * 100 + 250}ms` }}
                  />
                </div>
                <div className="w-full space-y-1">
                  <AnimatedSkeleton
                    variant="wave"
                    speed="slow"
                    className="h-4 w-full"
                    style={{ animationDelay: `${index * 100 + 300}ms` }}
                  />
                  <AnimatedSkeleton
                    variant="wave"
                    speed="slow"
                    className="h-4 w-full"
                    style={{ animationDelay: `${index * 100 + 350}ms` }}
                  />
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
    <Card className="animate-fade-in glass-morphism">
      <CardHeader>
        <AnimatedSkeleton variant="shimmer" speed="normal" className="h-8 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Weather */}
          <div className="space-y-4 animate-slide-in-left">
            <div className="flex items-center gap-4">
              <AnimatedSkeleton
                variant="shimmer"
                speed="normal"
                rounded="lg"
                className="h-20 w-20 animate-pulse-scale"
                style={{ animationDelay: '100ms' }}
              />
              <div className="space-y-2">
                <AnimatedSkeleton
                  variant="shimmer"
                  speed="normal"
                  className="h-14 w-32"
                  style={{ animationDelay: '200ms' }}
                />
                <AnimatedSkeleton
                  variant="pulse"
                  className="h-4 w-28"
                  style={{ animationDelay: '250ms' }}
                />
              </div>
            </div>
            <AnimatedSkeleton
              variant="wave"
              speed="slow"
              className="h-4 w-40"
              style={{ animationDelay: '300ms' }}
            />
            <div className="flex gap-4">
              <AnimatedSkeleton
                variant="shimmer"
                speed="fast"
                rounded="full"
                className="h-5 w-20"
                style={{ animationDelay: '350ms' }}
              />
              <AnimatedSkeleton
                variant="shimmer"
                speed="fast"
                rounded="full"
                className="h-5 w-20"
                style={{ animationDelay: '400ms' }}
              />
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 gap-3 animate-slide-in-right">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-2 rounded-lg border border-border/50 p-3',
                  'glass-morphism-card animate-scale-in',
                  'hover:shadow-md transition-all duration-300'
                )}
                style={{ animationDelay: `${index * 80 + 100}ms` }}
              >
                <AnimatedSkeleton
                  variant="pulse"
                  rounded="sm"
                  className="h-4 w-4"
                  style={{ animationDelay: `${index * 80 + 150}ms` }}
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <AnimatedSkeleton
                    variant="wave"
                    speed="fast"
                    className="h-3 w-16"
                    style={{ animationDelay: `${index * 80 + 200}ms` }}
                  />
                  <AnimatedSkeleton
                    variant="shimmer"
                    speed="normal"
                    className="h-4 w-20"
                    style={{ animationDelay: `${index * 80 + 250}ms` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Forecast */}
        <div
          className="mt-6 rounded-lg bg-muted/30 p-4 space-y-2 glass-morphism-card animate-fade-in-up"
          style={{ animationDelay: '600ms' }}
        >
          <AnimatedSkeleton
            variant="shimmer"
            speed="fast"
            className="h-5 w-24"
            style={{ animationDelay: '650ms' }}
          />
          <StaggeredContainer className="space-y-2">
            <AnimatedSkeleton
              variant="wave"
              speed="slow"
              className="h-4 w-full"
              style={{ animationDelay: '700ms' }}
            />
            <AnimatedSkeleton
              variant="wave"
              speed="slow"
              className="h-4 w-full"
              style={{ animationDelay: '750ms' }}
            />
            <AnimatedSkeleton
              variant="wave"
              speed="slow"
              className="h-4 w-4/5"
              style={{ animationDelay: '800ms' }}
            />
          </StaggeredContainer>
        </div>

        {/* Tonight's Forecast */}
        <div
          className="mt-4 rounded-lg border border-border/50 p-4 glass-morphism-card animate-fade-in-up"
          style={{ animationDelay: '850ms' }}
        >
          <div className="flex items-center gap-3">
            <AnimatedSkeleton
              variant="shimmer"
              speed="normal"
              rounded="lg"
              className="h-12 w-12 animate-pulse-scale"
              style={{ animationDelay: '900ms' }}
            />
            <div className="space-y-2 flex-1">
              <AnimatedSkeleton
                variant="shimmer"
                speed="normal"
                className="h-5 w-24"
                style={{ animationDelay: '950ms' }}
              />
              <AnimatedSkeleton
                variant="pulse"
                className="h-4 w-48"
                style={{ animationDelay: '1000ms' }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function HourlyForecastSkeleton() {
  return (
    <Card className="animate-fade-in glass-morphism">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <AnimatedSkeleton
            variant="shimmer"
            speed="normal"
            className="h-8 w-40"
            style={{ animationDelay: '0ms' }}
          />

          <div className="flex flex-wrap gap-3">
            <AnimatedSkeleton
              variant="wave"
              speed="fast"
              rounded="lg"
              className="h-10 w-[120px]"
              style={{ animationDelay: '100ms' }}
            />
            <div className="flex gap-2">
              <AnimatedSkeleton
                variant="shimmer"
                speed="fast"
                rounded="md"
                className="h-9 w-16"
                style={{ animationDelay: '150ms' }}
              />
              <AnimatedSkeleton
                variant="shimmer"
                speed="fast"
                rounded="md"
                className="h-9 w-16"
                style={{ animationDelay: '200ms' }}
              />
              <AnimatedSkeleton
                variant="shimmer"
                speed="fast"
                rounded="md"
                className="h-9 w-16"
                style={{ animationDelay: '250ms' }}
              />
              <AnimatedSkeleton
                variant="shimmer"
                speed="fast"
                rounded="md"
                className="h-9 w-20"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full flex items-end justify-around gap-2 px-4">
          {Array.from({ length: 12 }).map((_, index) => {
            const height = Math.random() * 150 + 100
            return (
              <div
                key={index}
                className="flex flex-col items-center gap-2 flex-1 animate-slide-in-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <AnimatedSkeleton
                  variant="shimmer"
                  speed="normal"
                  rounded="sm"
                  className="w-full animate-grow-height"
                  style={{
                    height: `${height}px`,
                    animationDelay: `${index * 60 + 100}ms`,
                  }}
                />
                <AnimatedSkeleton
                  variant="pulse"
                  className="h-3 w-8"
                  style={{ animationDelay: `${index * 60 + 150}ms` }}
                />
              </div>
            )
          })}
        </div>

        {/* Summary Stats */}
        <div
          className="mt-4 flex justify-around rounded-lg bg-muted/30 p-3 glass-morphism-card animate-fade-in-up"
          style={{ animationDelay: '800ms' }}
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="text-center space-y-1"
              style={{ animationDelay: `${index * 100 + 900}ms` }}
            >
              <AnimatedSkeleton
                variant="wave"
                speed="fast"
                className="h-4 w-12 mx-auto"
                style={{ animationDelay: `${index * 100 + 950}ms` }}
              />
              <AnimatedSkeleton
                variant="shimmer"
                speed="normal"
                className="h-5 w-16 mx-auto"
                style={{ animationDelay: `${index * 100 + 1000}ms` }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
