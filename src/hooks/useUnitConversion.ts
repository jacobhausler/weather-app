import { useLocalStorage } from './useLocalStorage'

export type UnitSystem = 'imperial' | 'metric'

interface ConversionResult {
  value: number
  unit: string
}

export function useUnitConversion() {
  const [unitSystem, setUnitSystem] = useLocalStorage<UnitSystem>('unit-system', 'imperial')

  // Temperature conversions
  const convertTemperature = (
    value: number,
    fromUnit: 'C' | 'F',
    toUnit?: 'C' | 'F'
  ): ConversionResult => {
    const targetUnit = toUnit || (unitSystem === 'metric' ? 'C' : 'F')

    if (fromUnit === targetUnit) {
      return { value: Math.round(value), unit: targetUnit }
    }

    let converted: number
    if (fromUnit === 'C' && targetUnit === 'F') {
      converted = (value * 9) / 5 + 32
    } else {
      // F to C
      converted = ((value - 32) * 5) / 9
    }

    return { value: Math.round(converted), unit: targetUnit }
  }

  // Wind speed conversions
  const convertWindSpeed = (
    value: number,
    fromUnit: 'wmoUnit:m_s-1' | 'wmoUnit:km_h-1' | 'mph' | 'm/s' | 'km/h',
    toUnit?: 'mph' | 'km/h' | 'm/s'
  ): ConversionResult => {
    const targetUnit = toUnit || (unitSystem === 'metric' ? 'km/h' : 'mph')

    // Convert to m/s first
    let metersPerSecond: number
    if (fromUnit === 'wmoUnit:m_s-1' || fromUnit === 'm/s') {
      metersPerSecond = value
    } else if (fromUnit === 'wmoUnit:km_h-1' || fromUnit === 'km/h') {
      metersPerSecond = value / 3.6
    } else {
      // mph
      metersPerSecond = value * 0.44704
    }

    // Convert to target unit
    let converted: number
    let unit: string
    if (targetUnit === 'm/s') {
      converted = metersPerSecond
      unit = 'm/s'
    } else if (targetUnit === 'km/h') {
      converted = metersPerSecond * 3.6
      unit = 'km/h'
    } else {
      // mph
      converted = metersPerSecond / 0.44704
      unit = 'mph'
    }

    return { value: Math.round(converted), unit }
  }

  // Visibility conversions
  const convertVisibility = (
    value: number,
    fromUnit: 'wmoUnit:m' | 'mi' | 'km' | 'm',
    toUnit?: 'mi' | 'km' | 'm'
  ): ConversionResult => {
    const targetUnit = toUnit || (unitSystem === 'metric' ? 'km' : 'mi')

    // Convert to meters first
    let meters: number
    if (fromUnit === 'wmoUnit:m' || fromUnit === 'm') {
      meters = value
    } else if (fromUnit === 'km') {
      meters = value * 1000
    } else {
      // miles
      meters = value * 1609.34
    }

    // Convert to target unit
    let converted: number
    let unit: string
    if (targetUnit === 'm') {
      converted = meters
      unit = 'm'
    } else if (targetUnit === 'km') {
      converted = meters / 1000
      unit = 'km'
    } else {
      // miles
      converted = meters / 1609.34
      unit = 'mi'
    }

    // Round to 1 decimal place for visibility
    return { value: Math.round(converted * 10) / 10, unit }
  }

  // Pressure conversions
  const convertPressure = (
    value: number,
    fromUnit: 'wmoUnit:Pa' | 'inHg' | 'hPa' | 'mb',
    toUnit?: 'inHg' | 'hPa' | 'mb'
  ): ConversionResult => {
    const targetUnit = toUnit || (unitSystem === 'metric' ? 'hPa' : 'inHg')

    // Convert to Pascals first
    let pascals: number
    if (fromUnit === 'wmoUnit:Pa') {
      pascals = value
    } else if (fromUnit === 'hPa' || fromUnit === 'mb') {
      pascals = value * 100
    } else {
      // inHg
      pascals = value * 3386.39
    }

    // Convert to target unit
    let converted: number
    let unit: string
    if (targetUnit === 'inHg') {
      converted = pascals / 3386.39
      unit = 'inHg'
    } else if (targetUnit === 'hPa') {
      converted = pascals / 100
      unit = 'hPa'
    } else {
      // mb (same as hPa)
      converted = pascals / 100
      unit = 'mb'
    }

    // Round to 2 decimal places for pressure
    return { value: Math.round(converted * 100) / 100, unit }
  }

  // Parse NWS unit codes
  const parseUnitCode = (unitCode: string): string => {
    if (unitCode.startsWith('wmoUnit:')) {
      const unit = unitCode.replace('wmoUnit:', '')
      // Convert underscore notation to readable format
      return unit.replace('_', ' ').replace('-1', '/s')
    }
    return unitCode
  }

  // Toggle between imperial and metric
  const toggleUnitSystem = () => {
    setUnitSystem(unitSystem === 'imperial' ? 'metric' : 'imperial')
  }

  return {
    unitSystem,
    setUnitSystem,
    toggleUnitSystem,
    convertTemperature,
    convertWindSpeed,
    convertVisibility,
    convertPressure,
    parseUnitCode
  }
}