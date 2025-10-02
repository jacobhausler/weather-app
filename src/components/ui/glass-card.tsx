import * as React from "react"
import { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Blur intensity: sm (4px), md (12px), lg (16px), xl (24px), 2xl (40px)
   * @default 'lg'
   */
  blur?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'

  /**
   * Enable gradient overlay (from top-left to bottom-right)
   * @default false
   */
  gradient?: boolean

  /**
   * Alert severity level (applies colored glass tint)
   */
  severity?: 'extreme' | 'severe' | 'moderate' | 'minor'

  /**
   * Enable hover effects (increased blur and shadow)
   * @default false
   */
  interactive?: boolean
}

const blurMap = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
  '2xl': 'backdrop-blur-2xl',
}

const severityMap = {
  extreme: 'glass-alert-extreme',
  severe: 'glass-alert-severe',
  moderate: 'glass-alert-moderate',
  minor: 'glass-alert-minor',
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({
    className,
    blur = 'lg',
    gradient = false,
    severity,
    interactive = false,
    children,
    ...props
  }, ref) => {
    // Determine base classes
    const baseClasses = severity
      ? severityMap[severity]
      : gradient
        ? 'glass-gradient glass-base'
        : 'glass-card'

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          blurMap[blur],
          interactive && 'glass-card-hover cursor-pointer',
          'rounded-xl',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
GlassCard.displayName = "GlassCard"

// Re-export Card sub-components for convenience
export { CardContent, CardHeader, CardTitle, CardDescription, CardFooter }
