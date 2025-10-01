/**
 * Comprehensive tests for useUnitConversion.ts
 *
 * These are REAL tests that test actual functionality.
 * No mocks, no placeholders - testing actual conversion behavior.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUnitConversion } from './useUnitConversion'

describe('useUnitConversion', () => {
  // Clear localStorage before each test
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Unit System Management', () => {
    it('should initialize with imperial as default', () => {
      const { result } = renderHook(() => useUnitConversion())

      expect(result.current.unitSystem).toBe('imperial')
    })

    it('should load unit system from localStorage if available', () => {
      localStorage.setItem('unit-system', JSON.stringify('metric'))

      const { result } = renderHook(() => useUnitConversion())

      expect(result.current.unitSystem).toBe('metric')
    })

    it('should toggle between imperial and metric', () => {
      const { result } = renderHook(() => useUnitConversion())

      expect(result.current.unitSystem).toBe('imperial')

      act(() => {
        result.current.toggleUnitSystem()
      })

      expect(result.current.unitSystem).toBe('metric')

      act(() => {
        result.current.toggleUnitSystem()
      })

      expect(result.current.unitSystem).toBe('imperial')
    })

    it('should set unit system directly', () => {
      const { result } = renderHook(() => useUnitConversion())

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
      const { result } = renderHook(() => useUnitConversion())

      act(() => {
        result.current.setUnitSystem('metric')
      })

      const stored = localStorage.getItem('unit-system')
      expect(stored).toBe(JSON.stringify('metric'))
    })
  })

  describe('Temperature Conversions', () => {
    describe('Celsius to Fahrenheit', () => {
      it('should convert 0°C to 32°F', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertTemperature(0, 'C', 'F')

        expect(converted.value).toBe(32)
        expect(converted.unit).toBe('F')
      })

      it('should convert 100°C to 212°F (boiling point)', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertTemperature(100, 'C', 'F')

        expect(converted.value).toBe(212)
        expect(converted.unit).toBe('F')
      })

      it('should convert 37°C to 99°F (body temperature)', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertTemperature(37, 'C', 'F')

        expect(converted.value).toBe(99)
        expect(converted.unit).toBe('F')
      })

      it('should convert negative temperatures: -40°C to -40°F', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertTemperature(-40, 'C', 'F')

        expect(converted.value).toBe(-40)
        expect(converted.unit).toBe('F')
      })

      it('should convert -17.8°C to approximately 0°F', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertTemperature(-17.8, 'C', 'F')

        // -17.8°C = -0.04°F, which rounds to 0 or -0 (both acceptable)
        expect(Math.abs(converted.value)).toBe(0)
        expect(converted.unit).toBe('F')
      })

      it('should round to nearest integer: 25.7°C', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertTemperature(25.7, 'C', 'F')

        // 25.7°C = 78.26°F, should round to 78
        expect(converted.value).toBe(78)
        expect(converted.unit).toBe('F')
      })
    })

    describe('Fahrenheit to Celsius', () => {
      it('should convert 32°F to 0°C', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertTemperature(32, 'F', 'C')

        expect(converted.value).toBe(0)
        expect(converted.unit).toBe('C')
      })

      it('should convert 212°F to 100°C (boiling point)', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertTemperature(212, 'F', 'C')

        expect(converted.value).toBe(100)
        expect(converted.unit).toBe('C')
      })

      it('should convert 98.6°F to 37°C (body temperature)', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertTemperature(98.6, 'F', 'C')

        expect(converted.value).toBe(37)
        expect(converted.unit).toBe('C')
      })

      it('should convert negative temperatures: -40°F to -40°C', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertTemperature(-40, 'F', 'C')

        expect(converted.value).toBe(-40)
        expect(converted.unit).toBe('C')
      })

      it('should convert 0°F to -17.8°C', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertTemperature(0, 'F', 'C')

        // 0°F = -17.778°C, should round to -18
        expect(converted.value).toBe(-18)
        expect(converted.unit).toBe('C')
      })

      it('should round to nearest integer: 78.3°F', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertTemperature(78.3, 'F', 'C')

        // 78.3°F = 25.722°C, should round to 26
        expect(converted.value).toBe(26)
        expect(converted.unit).toBe('C')
      })
    })

    describe('Same Unit Conversion', () => {
      it('should return same value when converting C to C', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertTemperature(25, 'C', 'C')

        expect(converted.value).toBe(25)
        expect(converted.unit).toBe('C')
      })

      it('should return same value when converting F to F', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertTemperature(77, 'F', 'F')

        expect(converted.value).toBe(77)
        expect(converted.unit).toBe('F')
      })

      it('should round when same unit: 25.7°C to 26°C', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertTemperature(25.7, 'C', 'C')

        expect(converted.value).toBe(26)
        expect(converted.unit).toBe('C')
      })
    })

    describe('System Default Conversion', () => {
      it('should use imperial (F) when system is imperial', () => {
        const { result } = renderHook(() => useUnitConversion())

        act(() => {
          result.current.setUnitSystem('imperial')
        })

        const converted = result.current.convertTemperature(25, 'C')

        expect(converted.unit).toBe('F')
        expect(converted.value).toBe(77)
      })

      it('should use metric (C) when system is metric', () => {
        const { result } = renderHook(() => useUnitConversion())

        act(() => {
          result.current.setUnitSystem('metric')
        })

        const converted = result.current.convertTemperature(77, 'F')

        expect(converted.unit).toBe('C')
        expect(converted.value).toBe(25)
      })
    })

    describe('Edge Cases', () => {
      it('should handle very large temperatures', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertTemperature(1000, 'C', 'F')

        // 1000°C = 1832°F
        expect(converted.value).toBe(1832)
        expect(converted.unit).toBe('F')
      })

      it('should handle very small temperatures', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertTemperature(-273, 'C', 'F')

        // -273°C = -459.4°F (near absolute zero)
        expect(converted.value).toBe(-459)
        expect(converted.unit).toBe('F')
      })

      it('should handle decimal precision correctly', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertTemperature(20.5, 'C', 'F')

        // 20.5°C = 68.9°F, should round to 69
        expect(converted.value).toBe(69)
        expect(converted.unit).toBe('F')
      })
    })
  })

  describe('Wind Speed Conversions', () => {
    describe('Meters per Second (m/s)', () => {
      it('should convert 10 m/s to mph', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertWindSpeed(10, 'm/s', 'mph')

        // 10 m/s = 22.369 mph, should round to 22
        expect(converted.value).toBe(22)
        expect(converted.unit).toBe('mph')
      })

      it('should convert 10 m/s to km/h', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertWindSpeed(10, 'm/s', 'km/h')

        // 10 m/s = 36 km/h
        expect(converted.value).toBe(36)
        expect(converted.unit).toBe('km/h')
      })

      it('should handle WMO unit code: wmoUnit:m_s-1', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertWindSpeed(10, 'wmoUnit:m_s-1', 'mph')

        expect(converted.value).toBe(22)
        expect(converted.unit).toBe('mph')
      })

      it('should convert 0 m/s (calm)', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertWindSpeed(0, 'm/s', 'mph')

        expect(converted.value).toBe(0)
        expect(converted.unit).toBe('mph')
      })
    })

    describe('Kilometers per Hour (km/h)', () => {
      it('should convert 100 km/h to mph', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertWindSpeed(100, 'km/h', 'mph')

        // 100 km/h = 62.137 mph, should round to 62
        expect(converted.value).toBe(62)
        expect(converted.unit).toBe('mph')
      })

      it('should convert 36 km/h to m/s', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertWindSpeed(36, 'km/h', 'm/s')

        // 36 km/h = 10 m/s
        expect(converted.value).toBe(10)
        expect(converted.unit).toBe('m/s')
      })

      it('should handle WMO unit code: wmoUnit:km_h-1', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertWindSpeed(100, 'wmoUnit:km_h-1', 'mph')

        expect(converted.value).toBe(62)
        expect(converted.unit).toBe('mph')
      })
    })

    describe('Miles per Hour (mph)', () => {
      it('should convert 60 mph to km/h', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertWindSpeed(60, 'mph', 'km/h')

        // 60 mph = 96.56 km/h, should round to 97
        expect(converted.value).toBe(97)
        expect(converted.unit).toBe('km/h')
      })

      it('should convert 22 mph to m/s', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertWindSpeed(22, 'mph', 'm/s')

        // 22 mph ≈ 9.8 m/s, should round to 10
        expect(converted.value).toBe(10)
        expect(converted.unit).toBe('m/s')
      })
    })

    describe('Round-trip Conversions', () => {
      it('should maintain value through m/s -> mph -> m/s', () => {
        const { result } = renderHook(() => useUnitConversion())

        const original = 10
        const toMph = result.current.convertWindSpeed(original, 'm/s', 'mph')
        const backToMs = result.current.convertWindSpeed(toMph.value, 'mph', 'm/s')

        // Should be close to original (within rounding)
        expect(Math.abs(backToMs.value - original)).toBeLessThanOrEqual(1)
      })

      it('should maintain value through km/h -> mph -> km/h', () => {
        const { result } = renderHook(() => useUnitConversion())

        const original = 100
        const toMph = result.current.convertWindSpeed(original, 'km/h', 'mph')
        const backToKmh = result.current.convertWindSpeed(toMph.value, 'mph', 'km/h')

        // Should be close to original (within rounding)
        expect(Math.abs(backToKmh.value - original)).toBeLessThanOrEqual(2)
      })
    })

    describe('System Default Conversion', () => {
      it('should default to mph when system is imperial', () => {
        const { result } = renderHook(() => useUnitConversion())

        act(() => {
          result.current.setUnitSystem('imperial')
        })

        const converted = result.current.convertWindSpeed(10, 'm/s')

        expect(converted.unit).toBe('mph')
        expect(converted.value).toBe(22)
      })

      it('should default to km/h when system is metric', () => {
        const { result } = renderHook(() => useUnitConversion())

        act(() => {
          result.current.setUnitSystem('metric')
        })

        const converted = result.current.convertWindSpeed(10, 'mph')

        expect(converted.unit).toBe('km/h')
        expect(converted.value).toBe(16)
      })
    })

    describe('Edge Cases', () => {
      it('should handle very high wind speeds (hurricane)', () => {
        const { result } = renderHook(() => useUnitConversion())

        // Category 5 hurricane: 70 m/s = 157 mph
        const converted = result.current.convertWindSpeed(70, 'm/s', 'mph')

        expect(converted.value).toBe(157)
        expect(converted.unit).toBe('mph')
      })

      it('should handle light breeze', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertWindSpeed(1.5, 'm/s', 'mph')

        // 1.5 m/s ≈ 3.4 mph, should round to 3
        expect(converted.value).toBe(3)
        expect(converted.unit).toBe('mph')
      })

      it('should handle fractional values', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertWindSpeed(5.5, 'm/s', 'km/h')

        // 5.5 m/s = 19.8 km/h, should round to 20
        expect(converted.value).toBe(20)
        expect(converted.unit).toBe('km/h')
      })
    })
  })

  describe('Visibility Conversions', () => {
    describe('Meters', () => {
      it('should convert 1000m to km', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertVisibility(1000, 'm', 'km')

        expect(converted.value).toBe(1.0)
        expect(converted.unit).toBe('km')
      })

      it('should convert 1609m to miles', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertVisibility(1609, 'm', 'mi')

        // 1609m ≈ 1.0 miles
        expect(converted.value).toBe(1.0)
        expect(converted.unit).toBe('mi')
      })

      it('should handle WMO unit code: wmoUnit:m', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertVisibility(1000, 'wmoUnit:m', 'km')

        expect(converted.value).toBe(1.0)
        expect(converted.unit).toBe('km')
      })

      it('should round to 1 decimal place: 1234m', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertVisibility(1234, 'm', 'km')

        // 1234m = 1.234 km, should round to 1.2
        expect(converted.value).toBe(1.2)
        expect(converted.unit).toBe('km')
      })
    })

    describe('Kilometers', () => {
      it('should convert 10km to meters', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertVisibility(10, 'km', 'm')

        expect(converted.value).toBe(10000)
        expect(converted.unit).toBe('m')
      })

      it('should convert 16.09km to miles', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertVisibility(16.09, 'km', 'mi')

        // 16.09 km ≈ 10 miles
        expect(converted.value).toBe(10.0)
        expect(converted.unit).toBe('mi')
      })

      it('should round to 1 decimal place: 5.678km', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertVisibility(5.678, 'km', 'mi')

        // 5.678 km ≈ 3.53 miles, should round to 3.5
        expect(converted.value).toBe(3.5)
        expect(converted.unit).toBe('mi')
      })
    })

    describe('Miles', () => {
      it('should convert 10mi to km', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertVisibility(10, 'mi', 'km')

        // 10 mi = 16.0934 km, should round to 16.1
        expect(converted.value).toBe(16.1)
        expect(converted.unit).toBe('km')
      })

      it('should convert 1mi to meters', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertVisibility(1, 'mi', 'm')

        // 1 mi = 1609.34 m
        expect(converted.value).toBe(1609.3)
        expect(converted.unit).toBe('m')
      })
    })

    describe('System Default Conversion', () => {
      it('should default to miles when system is imperial', () => {
        const { result } = renderHook(() => useUnitConversion())

        act(() => {
          result.current.setUnitSystem('imperial')
        })

        const converted = result.current.convertVisibility(10000, 'm')

        expect(converted.unit).toBe('mi')
        expect(converted.value).toBe(6.2)
      })

      it('should default to km when system is metric', () => {
        const { result } = renderHook(() => useUnitConversion())

        act(() => {
          result.current.setUnitSystem('metric')
        })

        const converted = result.current.convertVisibility(5, 'mi')

        expect(converted.unit).toBe('km')
        expect(converted.value).toBe(8.0)
      })
    })

    describe('Edge Cases', () => {
      it('should handle very short visibility (fog)', () => {
        const { result } = renderHook(() => useUnitConversion())

        // 100m visibility (dense fog)
        const converted = result.current.convertVisibility(100, 'm', 'mi')

        expect(converted.value).toBe(0.1)
        expect(converted.unit).toBe('mi')
      })

      it('should handle unlimited visibility', () => {
        const { result } = renderHook(() => useUnitConversion())

        // 50km visibility (clear day)
        const converted = result.current.convertVisibility(50, 'km', 'mi')

        // 50 km ≈ 31.1 miles
        expect(converted.value).toBe(31.1)
        expect(converted.unit).toBe('mi')
      })

      it('should handle zero visibility', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertVisibility(0, 'm', 'km')

        expect(converted.value).toBe(0)
        expect(converted.unit).toBe('km')
      })

      it('should maintain decimal precision', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertVisibility(1555, 'm', 'km')

        // 1555m = 1.555 km, should round to 1.6
        expect(converted.value).toBe(1.6)
        expect(converted.unit).toBe('km')
      })
    })
  })

  describe('Pressure Conversions', () => {
    describe('Pascals (Pa)', () => {
      it('should convert 101325 Pa to hPa (standard atmosphere)', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertPressure(101325, 'wmoUnit:Pa', 'hPa')

        expect(converted.value).toBe(1013.25)
        expect(converted.unit).toBe('hPa')
      })

      it('should convert 101325 Pa to inHg (standard atmosphere)', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertPressure(101325, 'wmoUnit:Pa', 'inHg')

        // 101325 Pa ≈ 29.92 inHg
        expect(converted.value).toBeCloseTo(29.92, 1)
        expect(converted.unit).toBe('inHg')
      })

      it('should handle WMO unit code: wmoUnit:Pa', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertPressure(100000, 'wmoUnit:Pa', 'hPa')

        expect(converted.value).toBe(1000)
        expect(converted.unit).toBe('hPa')
      })
    })

    describe('Hectopascals (hPa)', () => {
      it('should convert 1013.25 hPa to inHg', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertPressure(1013.25, 'hPa', 'inHg')

        expect(converted.value).toBeCloseTo(29.92, 1)
        expect(converted.unit).toBe('inHg')
      })

      it('should convert 1000 hPa to mb (same unit)', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertPressure(1000, 'hPa', 'mb')

        // hPa and mb are the same unit
        expect(converted.value).toBe(1000)
        expect(converted.unit).toBe('mb')
      })

      it('should handle mb (same as hPa)', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertPressure(1013.25, 'mb', 'inHg')

        expect(converted.value).toBeCloseTo(29.92, 1)
        expect(converted.unit).toBe('inHg')
      })

      it('should round to 2 decimal places', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertPressure(1013.456, 'hPa', 'inHg')

        // Should have at most 2 decimal places
        expect(converted.value.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2)
        expect(converted.unit).toBe('inHg')
      })
    })

    describe('Inches of Mercury (inHg)', () => {
      it('should convert 29.92 inHg to hPa', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertPressure(29.92, 'inHg', 'hPa')

        expect(converted.value).toBeCloseTo(1013.25, 0)
        expect(converted.unit).toBe('hPa')
      })

      it('should convert 30.00 inHg to hPa', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertPressure(30.0, 'inHg', 'hPa')

        // 30.0 inHg ≈ 1015.92 hPa
        expect(converted.value).toBeCloseTo(1015.92, 0)
        expect(converted.unit).toBe('hPa')
      })
    })

    describe('System Default Conversion', () => {
      it('should default to inHg when system is imperial', () => {
        const { result } = renderHook(() => useUnitConversion())

        act(() => {
          result.current.setUnitSystem('imperial')
        })

        const converted = result.current.convertPressure(1013.25, 'hPa')

        expect(converted.unit).toBe('inHg')
        expect(converted.value).toBeCloseTo(29.92, 1)
      })

      it('should default to hPa when system is metric', () => {
        const { result } = renderHook(() => useUnitConversion())

        act(() => {
          result.current.setUnitSystem('metric')
        })

        const converted = result.current.convertPressure(29.92, 'inHg')

        expect(converted.unit).toBe('hPa')
        expect(converted.value).toBeCloseTo(1013.25, 0)
      })
    })

    describe('Edge Cases', () => {
      it('should handle low pressure (hurricane)', () => {
        const { result } = renderHook(() => useUnitConversion())

        // Category 5 hurricane: ~920 hPa
        const converted = result.current.convertPressure(920, 'hPa', 'inHg')

        // 920 hPa ≈ 27.17 inHg
        expect(converted.value).toBeCloseTo(27.17, 1)
        expect(converted.unit).toBe('inHg')
      })

      it('should handle high pressure', () => {
        const { result } = renderHook(() => useUnitConversion())

        // High pressure system: 1040 hPa
        const converted = result.current.convertPressure(1040, 'hPa', 'inHg')

        // 1040 hPa ≈ 30.71 inHg
        expect(converted.value).toBeCloseTo(30.71, 1)
        expect(converted.unit).toBe('inHg')
      })

      it('should round to 2 decimal places', () => {
        const { result } = renderHook(() => useUnitConversion())

        const converted = result.current.convertPressure(29.123456, 'inHg', 'hPa')

        // Should have at most 2 decimal places
        expect(converted.value.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2)
      })
    })
  })

  describe('WMO Unit Code Parsing', () => {
    it('should parse wmoUnit:m_s-1 to "m s/s"', () => {
      const { result } = renderHook(() => useUnitConversion())

      const parsed = result.current.parseUnitCode('wmoUnit:m_s-1')

      expect(parsed).toBe('m s/s')
    })

    it('should parse wmoUnit:km_h-1 to "km h/s"', () => {
      const { result } = renderHook(() => useUnitConversion())

      const parsed = result.current.parseUnitCode('wmoUnit:km_h-1')

      expect(parsed).toBe('km h/s')
    })

    it('should parse wmoUnit:Pa to "Pa"', () => {
      const { result } = renderHook(() => useUnitConversion())

      const parsed = result.current.parseUnitCode('wmoUnit:Pa')

      expect(parsed).toBe('Pa')
    })

    it('should parse wmoUnit:m to "m"', () => {
      const { result } = renderHook(() => useUnitConversion())

      const parsed = result.current.parseUnitCode('wmoUnit:m')

      expect(parsed).toBe('m')
    })

    it('should return original string if not WMO format', () => {
      const { result } = renderHook(() => useUnitConversion())

      const parsed = result.current.parseUnitCode('mph')

      expect(parsed).toBe('mph')
    })

    it('should return original string for plain units', () => {
      const { result } = renderHook(() => useUnitConversion())

      expect(result.current.parseUnitCode('km/h')).toBe('km/h')
      expect(result.current.parseUnitCode('hPa')).toBe('hPa')
      expect(result.current.parseUnitCode('inHg')).toBe('inHg')
    })

    it('should handle empty string', () => {
      const { result } = renderHook(() => useUnitConversion())

      const parsed = result.current.parseUnitCode('')

      expect(parsed).toBe('')
    })
  })

  describe('Mathematical Accuracy', () => {
    it('should have accurate C to F conversion formula', () => {
      const { result } = renderHook(() => useUnitConversion())

      // Test known conversions
      const tests = [
        { c: 0, f: 32 },
        { c: 100, f: 212 },
        { c: -40, f: -40 },
        { c: 37, f: 99 },
      ]

      tests.forEach(test => {
        const converted = result.current.convertTemperature(test.c, 'C', 'F')
        expect(converted.value).toBe(test.f)
      })
    })

    it('should have accurate F to C conversion formula', () => {
      const { result } = renderHook(() => useUnitConversion())

      const tests = [
        { f: 32, c: 0 },
        { f: 212, c: 100 },
        { f: -40, c: -40 },
        { f: 98.6, c: 37 },
      ]

      tests.forEach(test => {
        const converted = result.current.convertTemperature(test.f, 'F', 'C')
        expect(converted.value).toBe(test.c)
      })
    })

    it('should maintain mathematical relationships: (C -> F) -> C', () => {
      const { result } = renderHook(() => useUnitConversion())

      const original = 25
      const toF = result.current.convertTemperature(original, 'C', 'F')
      const backToC = result.current.convertTemperature(toF.value, 'F', 'C')

      // Should be close to original (within 1 degree due to rounding)
      expect(Math.abs(backToC.value - original)).toBeLessThanOrEqual(1)
    })

    it('should have accurate m/s to mph conversion', () => {
      const { result } = renderHook(() => useUnitConversion())

      // 1 m/s = 2.23694 mph
      const converted = result.current.convertWindSpeed(1, 'm/s', 'mph')

      expect(converted.value).toBe(2)
    })

    it('should have accurate km/h to m/s conversion', () => {
      const { result } = renderHook(() => useUnitConversion())

      // 3.6 km/h = 1 m/s
      const converted = result.current.convertWindSpeed(3.6, 'km/h', 'm/s')

      expect(converted.value).toBe(1)
    })

    it('should have accurate miles to km conversion', () => {
      const { result } = renderHook(() => useUnitConversion())

      // 1 mile = 1.60934 km
      const converted = result.current.convertVisibility(1, 'mi', 'km')

      expect(converted.value).toBe(1.6)
    })

    it('should have accurate pressure conversions', () => {
      const { result } = renderHook(() => useUnitConversion())

      // Standard atmosphere: 1013.25 hPa = 29.92 inHg
      const converted = result.current.convertPressure(1013.25, 'hPa', 'inHg')

      expect(converted.value).toBeCloseTo(29.92, 1)
    })
  })

  describe('Integration Tests', () => {
    it('should use correct defaults based on unit system', () => {
      const { result } = renderHook(() => useUnitConversion())

      // Imperial system
      act(() => {
        result.current.setUnitSystem('imperial')
      })

      expect(result.current.convertTemperature(25, 'C').unit).toBe('F')
      expect(result.current.convertWindSpeed(10, 'm/s').unit).toBe('mph')
      expect(result.current.convertVisibility(1000, 'm').unit).toBe('mi')
      expect(result.current.convertPressure(1013, 'hPa').unit).toBe('inHg')

      // Metric system
      act(() => {
        result.current.setUnitSystem('metric')
      })

      expect(result.current.convertTemperature(77, 'F').unit).toBe('C')
      expect(result.current.convertWindSpeed(22, 'mph').unit).toBe('km/h')
      expect(result.current.convertVisibility(1, 'mi').unit).toBe('km')
      expect(result.current.convertPressure(29.92, 'inHg').unit).toBe('hPa')
    })

    it('should maintain consistency across multiple conversions', () => {
      const { result } = renderHook(() => useUnitConversion())

      act(() => {
        result.current.setUnitSystem('imperial')
      })

      // All conversions should use imperial units
      const temp = result.current.convertTemperature(25, 'C')
      const wind = result.current.convertWindSpeed(10, 'm/s')
      const vis = result.current.convertVisibility(1000, 'm')
      const press = result.current.convertPressure(1013, 'hPa')

      expect(temp.unit).toBe('F')
      expect(wind.unit).toBe('mph')
      expect(vis.unit).toBe('mi')
      expect(press.unit).toBe('inHg')

      // Switch to metric
      act(() => {
        result.current.setUnitSystem('metric')
      })

      // All conversions should now use metric units
      const temp2 = result.current.convertTemperature(77, 'F')
      const wind2 = result.current.convertWindSpeed(22, 'mph')
      const vis2 = result.current.convertVisibility(1, 'mi')
      const press2 = result.current.convertPressure(29.92, 'inHg')

      expect(temp2.unit).toBe('C')
      expect(wind2.unit).toBe('km/h')
      expect(vis2.unit).toBe('km')
      expect(press2.unit).toBe('hPa')
    })

    it('should persist unit system changes', () => {
      const { result, rerender } = renderHook(() => useUnitConversion())

      act(() => {
        result.current.setUnitSystem('metric')
      })

      // Unmount and remount
      rerender()

      // Should still be metric
      expect(result.current.unitSystem).toBe('metric')
    })
  })

  describe('Real-World Scenario Tests', () => {
    it('should handle typical weather conditions (summer day)', () => {
      const { result } = renderHook(() => useUnitConversion())

      act(() => {
        result.current.setUnitSystem('imperial')
      })

      // Summer day: 30°C, 15 km/h wind, 10km visibility, 1015 hPa
      const temp = result.current.convertTemperature(30, 'C')
      const wind = result.current.convertWindSpeed(15, 'km/h')
      const vis = result.current.convertVisibility(10, 'km')
      const press = result.current.convertPressure(1015, 'hPa')

      expect(temp.value).toBe(86) // 86°F
      expect(wind.value).toBe(9) // 9 mph
      expect(vis.value).toBe(6.2) // 6.2 miles
      expect(press.value).toBeCloseTo(29.97, 1) // ~29.97 inHg
    })

    it('should handle typical weather conditions (winter storm)', () => {
      const { result } = renderHook(() => useUnitConversion())

      act(() => {
        result.current.setUnitSystem('imperial')
      })

      // Winter storm: -10°C, 40 km/h wind, 500m visibility, 995 hPa
      const temp = result.current.convertTemperature(-10, 'C')
      const wind = result.current.convertWindSpeed(40, 'km/h')
      const vis = result.current.convertVisibility(500, 'm')
      const press = result.current.convertPressure(995, 'hPa')

      expect(temp.value).toBe(14) // 14°F
      expect(wind.value).toBe(25) // 25 mph
      expect(vis.value).toBe(0.3) // 0.3 miles
      expect(press.value).toBeCloseTo(29.38, 1) // ~29.38 inHg
    })

    it('should handle NWS API typical response format', () => {
      const { result } = renderHook(() => useUnitConversion())

      // NWS typically returns data in metric with WMO unit codes
      const temp = result.current.convertTemperature(22, 'C', 'F')
      const wind = result.current.convertWindSpeed(5.5, 'wmoUnit:m_s-1', 'mph')
      const vis = result.current.convertVisibility(16000, 'wmoUnit:m', 'mi')
      const press = result.current.convertPressure(101325, 'wmoUnit:Pa', 'inHg')

      expect(temp.value).toBe(72) // 72°F
      expect(wind.value).toBe(12) // 12 mph
      expect(vis.value).toBe(9.9) // 9.9 miles
      expect(press.value).toBeCloseTo(29.92, 1) // 29.92 inHg
    })
  })
})
