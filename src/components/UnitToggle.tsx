import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useUnitStore } from '@/stores/unitStore'

export function UnitToggle() {
  const { unitSystem, setUnitSystem } = useUnitStore()

  const isMetric = unitSystem === 'metric'

  const handleToggle = (checked: boolean) => {
    setUnitSystem(checked ? 'metric' : 'imperial')
  }

  return (
    <div className="flex items-center gap-3">
      <Label
        htmlFor="unit-toggle"
        className={`text-sm font-medium ${!isMetric ? 'text-foreground' : 'text-muted-foreground'}`}
      >
        Imperial
      </Label>
      <Switch
        id="unit-toggle"
        checked={isMetric}
        onCheckedChange={handleToggle}
        aria-label="Toggle between Imperial and Metric units"
      />
      <Label
        htmlFor="unit-toggle"
        className={`text-sm font-medium ${isMetric ? 'text-foreground' : 'text-muted-foreground'}`}
      >
        Metric
      </Label>
    </div>
  )
}