import { useState, FormEvent, KeyboardEvent } from 'react'
import { MapPin, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useWeatherStore } from '@/stores/weatherStore'
import { apiService } from '@/services/api'

export function ZipInput() {
  const [inputValue, setInputValue] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const {
    setZipCode,
    setWeatherData,
    setLoading,
    setError,
    addRecentZipCode,
    recentZipCodes,
    isLoading
  } = useWeatherStore()

  const validateZipCode = (zip: string): boolean => {
    // US ZIP code validation: 5 digits
    const zipRegex = /^\d{5}$/
    return zipRegex.test(zip)
  }

  const fetchWeather = async (zipCode: string) => {
    if (!validateZipCode(zipCode)) {
      setValidationError('Please enter a valid 5-digit ZIP code')
      return
    }

    setValidationError(null)
    setLoading(true)
    setZipCode(zipCode)

    try {
      const data = await apiService.getWeatherByZip(zipCode)
      setWeatherData(data)
      addRecentZipCode(zipCode)
      setInputValue('')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch weather data'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      fetchWeather(inputValue.trim())
    }
  }

  const handleRecentZipClick = (zipCode: string) => {
    fetchWeather(zipCode)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Only allow numbers
    if (
      e.key.length === 1 &&
      !/\d/.test(e.key) &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(
        e.key
      )
    ) {
      e.preventDefault()
    }
  }

  const handleInputChange = (value: string) => {
    // Limit to 5 digits
    if (value.length <= 5) {
      setInputValue(value)
      // Clear error when input is empty or becomes valid
      if (validationError && (value.length === 0 || validateZipCode(value))) {
        setValidationError(null)
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            inputMode="numeric"
            pattern="\d{5}"
            placeholder="Enter ZIP code"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="pr-10"
            aria-label="ZIP code input"
            aria-invalid={!!validationError}
            aria-describedby={validationError ? 'zip-error' : undefined}
          />
          <MapPin className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        <Button type="submit" disabled={isLoading || !inputValue.trim()}>
          Submit
        </Button>

        {recentZipCodes.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={isLoading}
                aria-label="Recent ZIP codes"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {recentZipCodes.map((zip) => (
                <DropdownMenuItem
                  key={zip}
                  onClick={() => handleRecentZipClick(zip)}
                >
                  {zip}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </form>

      {validationError && (
        <p
          id="zip-error"
          className="text-sm text-destructive"
          role="alert"
          aria-live="polite"
        >
          {validationError}
        </p>
      )}
    </div>
  )
}