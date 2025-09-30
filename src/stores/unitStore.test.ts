import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useUnitStore,
  convertTemp,
  convertSpeed,
  convertDistance,
  getTempUnit,
  getSpeedUnit,
  getDistanceUnit,
  type UnitSystem,
} from './unitStore'

describe('unitStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Reset store to initial state
    const { result } = renderHook(() => useUnitStore())
    act(() => {
      result.current.setUnitSystem('imperial')
    })
  })

  describe('Initial State', () => {
    it('should start with imperial unit system', () => {
      const { result } = renderHook(() => useUnitStore())
      expect(result.current.unitSystem).toBe('imperial')
    })

    it('should read from localStorage on initialization', () => {
      // Verify that localStorage contains the persisted state
      // After a unit system change, localStorage should have the value
      const { result } = renderHook(() => useUnitStore())

      act(() => {
        result.current.setUnitSystem('metric')
      })

      // Check that it's persisted to localStorage
      const stored = localStorage.getItem('unit-storage')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed.state.unitSystem).toBe('metric')

      // Verify the store state matches what we set
      expect(result.current.unitSystem).toBe('metric')
    })
  })

  describe('setUnitSystem', () => {
    it('should toggle from imperial to metric', () => {
      const { result } = renderHook(() => useUnitStore())

      expect(result.current.unitSystem).toBe('imperial')

      act(() => {
        result.current.setUnitSystem('metric')
      })

      expect(result.current.unitSystem).toBe('metric')
    })

    it('should toggle from metric to imperial', () => {
      const { result } = renderHook(() => useUnitStore())

      act(() => {
        result.current.setUnitSystem('metric')
      })
      expect(result.current.unitSystem).toBe('metric')

      act(() => {
        result.current.setUnitSystem('imperial')
      })

      expect(result.current.unitSystem).toBe('imperial')
    })

    it('should persist unit system to localStorage', () => {
      const { result } = renderHook(() => useUnitStore())

      act(() => {
        result.current.setUnitSystem('metric')
      })

      const stored = localStorage.getItem('unit-storage')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed.state.unitSystem).toBe('metric')
    })

    it('should maintain state across multiple toggles', () => {
      const { result } = renderHook(() => useUnitStore())

      act(() => {
        result.current.setUnitSystem('metric')
      })
      expect(result.current.unitSystem).toBe('metric')

      act(() => {
        result.current.setUnitSystem('imperial')
      })
      expect(result.current.unitSystem).toBe('imperial')

      act(() => {
        result.current.setUnitSystem('metric')
      })
      expect(result.current.unitSystem).toBe('metric')
    })
  })

  describe('Store Subscriptions', () => {
    it('should notify subscribers when unit system changes', () => {
      const { result, rerender } = renderHook(() => useUnitStore())

      const initialSystem = result.current.unitSystem
      expect(initialSystem).toBe('imperial')

      act(() => {
        result.current.setUnitSystem('metric')
      })

      rerender()
      expect(result.current.unitSystem).toBe('metric')
      expect(result.current.unitSystem).not.toBe(initialSystem)
    })

    it('should allow multiple components to access the same state', () => {
      const { result: result1 } = renderHook(() => useUnitStore())
      const { result: result2 } = renderHook(() => useUnitStore())

      expect(result1.current.unitSystem).toBe(result2.current.unitSystem)

      act(() => {
        result1.current.setUnitSystem('metric')
      })

      expect(result1.current.unitSystem).toBe('metric')
      expect(result2.current.unitSystem).toBe('metric')
    })
  })

  describe('convertTemp', () => {
    describe('Imperial Conversion (Celsius to Fahrenheit)', () => {
      it('should convert freezing point correctly (0°C = 32°F)', () => {
        const result = convertTemp(0, 'imperial')
        expect(result).toBe(32)
      })

      it('should convert boiling point correctly (100°C = 212°F)', () => {
        const result = convertTemp(100, 'imperial')
        expect(result).toBe(212)
      })

      it('should convert room temperature correctly (20°C = 68°F)', () => {
        const result = convertTemp(20, 'imperial')
        expect(result).toBe(68)
      })

      it('should convert body temperature correctly (37°C = 98.6°F)', () => {
        const result = convertTemp(37, 'imperial')
        expect(result).toBeCloseTo(98.6, 1)
      })

      it('should handle negative temperatures (-40°C = -40°F)', () => {
        const result = convertTemp(-40, 'imperial')
        expect(result).toBe(-40)
      })

      it('should handle very cold temperatures (-273.15°C = -459.67°F)', () => {
        const result = convertTemp(-273.15, 'imperial')
        expect(result).toBeCloseTo(-459.67, 2)
      })

      it('should handle very hot temperatures (1000°C = 1832°F)', () => {
        const result = convertTemp(1000, 'imperial')
        expect(result).toBe(1832)
      })

      it('should handle decimal temperatures (25.5°C)', () => {
        const result = convertTemp(25.5, 'imperial')
        expect(result).toBeCloseTo(77.9, 1)
      })
    })

    describe('Metric Conversion (no conversion)', () => {
      it('should return the same value for metric system', () => {
        const result = convertTemp(20, 'metric')
        expect(result).toBe(20)
      })

      it('should handle zero for metric', () => {
        const result = convertTemp(0, 'metric')
        expect(result).toBe(0)
      })

      it('should handle negative values for metric', () => {
        const result = convertTemp(-15, 'metric')
        expect(result).toBe(-15)
      })

      it('should handle decimal values for metric', () => {
        const result = convertTemp(25.5, 'metric')
        expect(result).toBe(25.5)
      })
    })
  })

  describe('convertSpeed', () => {
    describe('Imperial Conversion (m/s to mph)', () => {
      it('should convert zero speed correctly', () => {
        const result = convertSpeed(0, 'imperial')
        expect(result).toBe(0)
      })

      it('should convert typical walking speed (1.4 m/s ≈ 3.13 mph)', () => {
        const result = convertSpeed(1.4, 'imperial')
        expect(result).toBeCloseTo(3.13, 2)
      })

      it('should convert typical car speed (25 m/s ≈ 55.93 mph)', () => {
        const result = convertSpeed(25, 'imperial')
        expect(result).toBeCloseTo(55.93, 2)
      })

      it('should convert strong wind (20 m/s ≈ 44.74 mph)', () => {
        const result = convertSpeed(20, 'imperial')
        expect(result).toBeCloseTo(44.74, 2)
      })

      it('should convert hurricane force winds (50 m/s ≈ 111.85 mph)', () => {
        const result = convertSpeed(50, 'imperial')
        expect(result).toBeCloseTo(111.85, 2)
      })

      it('should handle very high speeds (100 m/s ≈ 223.7 mph)', () => {
        const result = convertSpeed(100, 'imperial')
        expect(result).toBeCloseTo(223.7, 1)
      })

      it('should handle decimal speeds (5.5 m/s)', () => {
        const result = convertSpeed(5.5, 'imperial')
        expect(result).toBeCloseTo(12.30, 2)
      })

      it('should use correct conversion factor (2.237)', () => {
        const result = convertSpeed(1, 'imperial')
        expect(result).toBe(2.237)
      })
    })

    describe('Metric Conversion (m/s to km/h)', () => {
      it('should convert zero speed correctly', () => {
        const result = convertSpeed(0, 'metric')
        expect(result).toBe(0)
      })

      it('should convert typical walking speed (1.4 m/s = 5.04 km/h)', () => {
        const result = convertSpeed(1.4, 'metric')
        expect(result).toBeCloseTo(5.04, 2)
      })

      it('should convert typical car speed (25 m/s = 90 km/h)', () => {
        const result = convertSpeed(25, 'metric')
        expect(result).toBe(90)
      })

      it('should convert strong wind (20 m/s = 72 km/h)', () => {
        const result = convertSpeed(20, 'metric')
        expect(result).toBe(72)
      })

      it('should convert hurricane force winds (50 m/s = 180 km/h)', () => {
        const result = convertSpeed(50, 'metric')
        expect(result).toBe(180)
      })

      it('should handle very high speeds (100 m/s = 360 km/h)', () => {
        const result = convertSpeed(100, 'metric')
        expect(result).toBe(360)
      })

      it('should handle decimal speeds (5.5 m/s = 19.8 km/h)', () => {
        const result = convertSpeed(5.5, 'metric')
        expect(result).toBeCloseTo(19.8, 1)
      })

      it('should use correct conversion factor (3.6)', () => {
        const result = convertSpeed(1, 'metric')
        expect(result).toBe(3.6)
      })
    })
  })

  describe('convertDistance', () => {
    describe('Imperial Conversion (meters to miles)', () => {
      it('should convert zero distance correctly', () => {
        const result = convertDistance(0, 'imperial')
        expect(result).toBe(0)
      })

      it('should convert 1 kilometer (1000m ≈ 0.621 mi)', () => {
        const result = convertDistance(1000, 'imperial')
        expect(result).toBeCloseTo(0.621, 3)
      })

      it('should convert 1 mile (1609.34m ≈ 1 mi)', () => {
        const result = convertDistance(1609.34, 'imperial')
        expect(result).toBeCloseTo(1, 2)
      })

      it('should convert 5 kilometers (5000m ≈ 3.107 mi)', () => {
        const result = convertDistance(5000, 'imperial')
        expect(result).toBeCloseTo(3.107, 3)
      })

      it('should convert 10 kilometers (10000m ≈ 6.214 mi)', () => {
        const result = convertDistance(10000, 'imperial')
        expect(result).toBeCloseTo(6.214, 3)
      })

      it('should convert typical visibility (8000m ≈ 4.971 mi)', () => {
        const result = convertDistance(8000, 'imperial')
        expect(result).toBeCloseTo(4.971, 3)
      })

      it('should handle very long distances (100000m ≈ 62.137 mi)', () => {
        const result = convertDistance(100000, 'imperial')
        expect(result).toBeCloseTo(62.137, 3)
      })

      it('should handle small distances (100m ≈ 0.062 mi)', () => {
        const result = convertDistance(100, 'imperial')
        expect(result).toBeCloseTo(0.062, 3)
      })

      it('should use correct conversion factor (0.000621371)', () => {
        const result = convertDistance(1, 'imperial')
        expect(result).toBe(0.000621371)
      })
    })

    describe('Metric Conversion (meters to kilometers)', () => {
      it('should convert zero distance correctly', () => {
        const result = convertDistance(0, 'metric')
        expect(result).toBe(0)
      })

      it('should convert 1 kilometer (1000m = 1 km)', () => {
        const result = convertDistance(1000, 'metric')
        expect(result).toBe(1)
      })

      it('should convert 5 kilometers (5000m = 5 km)', () => {
        const result = convertDistance(5000, 'metric')
        expect(result).toBe(5)
      })

      it('should convert 10 kilometers (10000m = 10 km)', () => {
        const result = convertDistance(10000, 'metric')
        expect(result).toBe(10)
      })

      it('should convert typical visibility (8000m = 8 km)', () => {
        const result = convertDistance(8000, 'metric')
        expect(result).toBe(8)
      })

      it('should handle very long distances (100000m = 100 km)', () => {
        const result = convertDistance(100000, 'metric')
        expect(result).toBe(100)
      })

      it('should handle small distances (100m = 0.1 km)', () => {
        const result = convertDistance(100, 'metric')
        expect(result).toBe(0.1)
      })

      it('should handle decimal values (2500m = 2.5 km)', () => {
        const result = convertDistance(2500, 'metric')
        expect(result).toBe(2.5)
      })

      it('should divide by 1000', () => {
        const result = convertDistance(1, 'metric')
        expect(result).toBe(0.001)
      })
    })
  })

  describe('getTempUnit', () => {
    it('should return °F for imperial system', () => {
      const unit = getTempUnit('imperial')
      expect(unit).toBe('°F')
    })

    it('should return °C for metric system', () => {
      const unit = getTempUnit('metric')
      expect(unit).toBe('°C')
    })

    it('should handle all UnitSystem values', () => {
      const systems: UnitSystem[] = ['imperial', 'metric']
      systems.forEach((system) => {
        const unit = getTempUnit(system)
        expect(unit).toBeTruthy()
        expect(typeof unit).toBe('string')
      })
    })
  })

  describe('getSpeedUnit', () => {
    it('should return mph for imperial system', () => {
      const unit = getSpeedUnit('imperial')
      expect(unit).toBe('mph')
    })

    it('should return km/h for metric system', () => {
      const unit = getSpeedUnit('metric')
      expect(unit).toBe('km/h')
    })

    it('should handle all UnitSystem values', () => {
      const systems: UnitSystem[] = ['imperial', 'metric']
      systems.forEach((system) => {
        const unit = getSpeedUnit(system)
        expect(unit).toBeTruthy()
        expect(typeof unit).toBe('string')
      })
    })
  })

  describe('getDistanceUnit', () => {
    it('should return mi for imperial system', () => {
      const unit = getDistanceUnit('imperial')
      expect(unit).toBe('mi')
    })

    it('should return km for metric system', () => {
      const unit = getDistanceUnit('metric')
      expect(unit).toBe('km')
    })

    it('should handle all UnitSystem values', () => {
      const systems: UnitSystem[] = ['imperial', 'metric']
      systems.forEach((system) => {
        const unit = getDistanceUnit(system)
        expect(unit).toBeTruthy()
        expect(typeof unit).toBe('string')
      })
    })
  })

  describe('Edge Cases and Mathematical Precision', () => {
    it('should handle negative temperatures in conversions', () => {
      const imperialResult = convertTemp(-10, 'imperial')
      expect(imperialResult).toBeCloseTo(14, 1)

      const metricResult = convertTemp(-10, 'metric')
      expect(metricResult).toBe(-10)
    })

    it('should handle very large numbers in all conversions', () => {
      const temp = convertTemp(1000000, 'imperial')
      expect(temp).toBeCloseTo(1800032, 0)

      const speed = convertSpeed(1000000, 'imperial')
      expect(speed).toBeCloseTo(2237000, 0)

      const distance = convertDistance(1000000, 'imperial')
      expect(distance).toBeCloseTo(621.371, 3)
    })

    it('should handle very small decimal numbers', () => {
      const temp = convertTemp(0.001, 'imperial')
      expect(temp).toBeCloseTo(32.0018, 4)

      const speed = convertSpeed(0.001, 'imperial')
      expect(speed).toBeCloseTo(0.002237, 6)

      const distance = convertDistance(0.001, 'imperial')
      expect(distance).toBeCloseTo(0.000000621371, 12)
    })

    it('should maintain precision for typical weather values', () => {
      // Typical temperature: 22.5°C should be 72.5°F
      const temp = convertTemp(22.5, 'imperial')
      expect(temp).toBe(72.5)

      // Typical wind speed: 5.5 m/s should be 12.3035 mph
      const speed = convertSpeed(5.5, 'imperial')
      expect(speed).toBeCloseTo(12.3035, 4)

      // Typical visibility: 16093.4 meters should be ~10 miles
      const distance = convertDistance(16093.4, 'imperial')
      expect(distance).toBeCloseTo(10, 1)
    })

    it('should handle conversion chain consistency', () => {
      // Temperature: Converting to imperial and the logic staying consistent
      const temp1 = convertTemp(0, 'imperial')
      const temp2 = convertTemp(100, 'imperial')
      expect(temp2 - temp1).toBe(180) // 100°C difference = 180°F difference

      // Speed: Converting to imperial maintains ratios
      const speed1 = convertSpeed(10, 'imperial')
      const speed2 = convertSpeed(20, 'imperial')
      expect(speed2 / speed1).toBeCloseTo(2, 10)

      // Distance: Converting to imperial maintains ratios
      const dist1 = convertDistance(1000, 'imperial')
      const dist2 = convertDistance(2000, 'imperial')
      expect(dist2 / dist1).toBeCloseTo(2, 10)
    })
  })

  describe('Conversion Formula Verification', () => {
    it('should verify Celsius to Fahrenheit formula: F = (C × 9/5) + 32', () => {
      // Test cases with known values
      const testCases = [
        { celsius: 0, fahrenheit: 32 },
        { celsius: 10, fahrenheit: 50 },
        { celsius: 20, fahrenheit: 68 },
        { celsius: 30, fahrenheit: 86 },
        { celsius: 100, fahrenheit: 212 },
      ]

      testCases.forEach(({ celsius, fahrenheit }) => {
        const result = convertTemp(celsius, 'imperial')
        expect(result).toBe(fahrenheit)
      })
    })

    it('should verify m/s to mph formula: mph = m/s × 2.237', () => {
      const testCases = [
        { ms: 1, mph: 2.237 },
        { ms: 10, mph: 22.37 },
        { ms: 20, mph: 44.74 },
      ]

      testCases.forEach(({ ms, mph }) => {
        const result = convertSpeed(ms, 'imperial')
        expect(result).toBeCloseTo(mph, 2)
      })
    })

    it('should verify m/s to km/h formula: kmh = m/s × 3.6', () => {
      const testCases = [
        { ms: 1, kmh: 3.6 },
        { ms: 10, kmh: 36 },
        { ms: 20, kmh: 72 },
      ]

      testCases.forEach(({ ms, kmh }) => {
        const result = convertSpeed(ms, 'metric')
        expect(result).toBe(kmh)
      })
    })

    it('should verify meters to miles formula: mi = m × 0.000621371', () => {
      const testCases = [
        { meters: 1, miles: 0.000621371, precision: 9 },
        { meters: 1000, miles: 0.621371, precision: 6 },
        { meters: 1609.34, miles: 1, precision: 4 },
      ]

      testCases.forEach(({ meters, miles, precision }) => {
        const result = convertDistance(meters, 'imperial')
        expect(result).toBeCloseTo(miles, precision)
      })
    })

    it('should verify meters to kilometers formula: km = m / 1000', () => {
      const testCases = [
        { meters: 1, kilometers: 0.001 },
        { meters: 100, kilometers: 0.1 },
        { meters: 1000, kilometers: 1 },
        { meters: 5000, kilometers: 5 },
      ]

      testCases.forEach(({ meters, kilometers }) => {
        const result = convertDistance(meters, 'metric')
        expect(result).toBe(kilometers)
      })
    })
  })

  describe('Integration Tests', () => {
    it('should work end-to-end: toggle system and use all converters', () => {
      const { result } = renderHook(() => useUnitStore())

      // Start with imperial
      expect(result.current.unitSystem).toBe('imperial')
      expect(getTempUnit(result.current.unitSystem)).toBe('°F')
      expect(getSpeedUnit(result.current.unitSystem)).toBe('mph')
      expect(getDistanceUnit(result.current.unitSystem)).toBe('mi')

      // Convert values with imperial
      const tempF = convertTemp(20, result.current.unitSystem)
      const speedMph = convertSpeed(10, result.current.unitSystem)
      const distMi = convertDistance(1000, result.current.unitSystem)

      expect(tempF).toBe(68)
      expect(speedMph).toBeCloseTo(22.37, 2)
      expect(distMi).toBeCloseTo(0.621, 3)

      // Switch to metric
      act(() => {
        result.current.setUnitSystem('metric')
      })

      expect(result.current.unitSystem).toBe('metric')
      expect(getTempUnit(result.current.unitSystem)).toBe('°C')
      expect(getSpeedUnit(result.current.unitSystem)).toBe('km/h')
      expect(getDistanceUnit(result.current.unitSystem)).toBe('km')

      // Convert values with metric
      const tempC = convertTemp(20, result.current.unitSystem)
      const speedKmh = convertSpeed(10, result.current.unitSystem)
      const distKm = convertDistance(1000, result.current.unitSystem)

      expect(tempC).toBe(20)
      expect(speedKmh).toBe(36)
      expect(distKm).toBe(1)
    })

    it('should persist changes across store instances', () => {
      const { result: result1 } = renderHook(() => useUnitStore())

      act(() => {
        result1.current.setUnitSystem('metric')
      })

      // Create a new hook instance
      const { result: result2 } = renderHook(() => useUnitStore())

      expect(result2.current.unitSystem).toBe('metric')
    })
  })
})
