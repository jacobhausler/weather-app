import { useUnitStore } from '@/stores/unitStore'

export function UnitToggle() {
  const { unitSystem, setUnitSystem } = useUnitStore()

  const isMetric = unitSystem === 'metric'

  const handleToggle = () => {
    setUnitSystem(isMetric ? 'imperial' : 'metric')
  }

  return (
    <div className="inline-flex items-center gap-3">
      {/* Imperial Label */}
      <button
        onClick={() => !isMetric || handleToggle()}
        className={`text-sm font-medium transition-all duration-300 ease-out
                   select-none cursor-pointer
                   ${!isMetric
                     ? 'text-foreground drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                     : 'text-muted-foreground hover:text-foreground/70'}`}
        aria-label="Select Imperial units"
      >
        Imperial
      </button>

      {/* Toggle Switch Container */}
      <button
        onClick={handleToggle}
        role="switch"
        aria-checked={isMetric}
        aria-label="Toggle between Imperial and Metric units"
        className="group relative h-8 w-16 rounded-full overflow-hidden
                   backdrop-blur-xl bg-white/10 dark:bg-black/10
                   border border-white/20 dark:border-white/10
                   shadow-lg shadow-black/5 dark:shadow-black/20
                   hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30
                   hover:scale-105 active:scale-95
                   transition-all duration-300 ease-out
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                   focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {/* Animated gradient background */}
        <div
          className="absolute inset-0 transition-all duration-500 ease-out"
          style={{
            background: isMetric
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15))'
              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15))',
            opacity: 1
          }}
        />

        {/* Hover glow effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: isMetric
              ? 'radial-gradient(circle at 75% center, rgba(34, 197, 94, 0.2), transparent 70%)'
              : 'radial-gradient(circle at 25% center, rgba(59, 130, 246, 0.2), transparent 70%)'
          }}
        />

        {/* Track indicators */}
        <div className="absolute inset-0 flex items-center justify-between px-2">
          {/* Imperial indicator */}
          <div
            className={`text-[10px] font-bold tracking-wider transition-all duration-300
                       ${!isMetric
                         ? 'opacity-0 scale-75'
                         : 'opacity-40 scale-100 text-blue-400'}`}
          >
            F
          </div>
          {/* Metric indicator */}
          <div
            className={`text-[10px] font-bold tracking-wider transition-all duration-300
                       ${isMetric
                         ? 'opacity-0 scale-75'
                         : 'opacity-40 scale-100 text-green-400'}`}
          >
            C
          </div>
        </div>

        {/* Sliding thumb */}
        <div
          className={`absolute top-1 bottom-1 w-6 rounded-full
                     backdrop-blur-md bg-white/90 dark:bg-white/80
                     shadow-lg shadow-black/20
                     transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                     ${isMetric ? 'translate-x-9' : 'translate-x-1'}`}
          style={{
            boxShadow: isMetric
              ? '0 4px 12px rgba(34, 197, 94, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)'
              : '0 4px 12px rgba(59, 130, 246, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Thumb inner glow */}
          <div
            className="absolute inset-0 rounded-full transition-all duration-500"
            style={{
              background: isMetric
                ? 'radial-gradient(circle at center, rgba(34, 197, 94, 0.2), transparent 60%)'
                : 'radial-gradient(circle at center, rgba(59, 130, 246, 0.2), transparent 60%)'
            }}
          />

          {/* Thumb icon/indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-2 h-2 rounded-full transition-all duration-500
                         ${isMetric
                           ? 'bg-gradient-to-br from-green-400 to-emerald-500 scale-100'
                           : 'bg-gradient-to-br from-blue-400 to-purple-500 scale-100'}`}
              style={{
                boxShadow: isMetric
                  ? '0 0 8px rgba(34, 197, 94, 0.6)'
                  : '0 0 8px rgba(59, 130, 246, 0.6)'
              }}
            />
          </div>
        </div>

        {/* Active state ripple */}
        <div className="absolute inset-0 rounded-full
                       group-active:bg-white/10 dark:group-active:bg-white/5
                       transition-colors duration-150" />
      </button>

      {/* Metric Label */}
      <button
        onClick={() => isMetric || handleToggle()}
        className={`text-sm font-medium transition-all duration-300 ease-out
                   select-none cursor-pointer
                   ${isMetric
                     ? 'text-foreground drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]'
                     : 'text-muted-foreground hover:text-foreground/70'}`}
        aria-label="Select Metric units"
      >
        Metric
      </button>
    </div>
  )
}
