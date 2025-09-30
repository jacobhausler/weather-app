import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UnitSystem = 'imperial' | 'metric'

interface UnitState {
  unitSystem: UnitSystem
  setUnitSystem: (system: UnitSystem) => void
}

export const useUnitStore = create<UnitState>()(
  persist(
    (set) => ({
      unitSystem: 'imperial',
      setUnitSystem: (system) => set({ unitSystem: system })
    }),
    {
      name: 'unit-storage'
    }
  )
)

// Conversion utilities
export const convertTemp = (celsius: number, toSystem: UnitSystem): number => {
  if (toSystem === 'imperial') {
    return (celsius * 9) / 5 + 32
  }
  return celsius
}

export const convertSpeed = (
  metersPerSecond: number,
  toSystem: UnitSystem
): number => {
  if (toSystem === 'imperial') {
    // Convert to mph
    return metersPerSecond * 2.237
  }
  // Convert to km/h
  return metersPerSecond * 3.6
}

export const convertDistance = (meters: number, toSystem: UnitSystem): number => {
  if (toSystem === 'imperial') {
    // Convert to miles
    return meters * 0.000621371
  }
  // Convert to kilometers
  return meters / 1000
}

export const getTempUnit = (system: UnitSystem): string => {
  return system === 'imperial' ? '°F' : '°C'
}

export const getSpeedUnit = (system: UnitSystem): string => {
  return system === 'imperial' ? 'mph' : 'km/h'
}

export const getDistanceUnit = (system: UnitSystem): string => {
  return system === 'imperial' ? 'mi' : 'km'
}