import { useState, FormEvent, KeyboardEvent } from 'react'
import { MapPin, ChevronDown, Sparkles } from 'lucide-react'
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
  const [isFocused, setIsFocused] = useState(false)
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
        {/* Glass morphism input wrapper */}
        <div className="relative flex-1 group">
          <div
            className={`
              absolute inset-0 rounded-lg transition-all duration-300
              ${
                isFocused
                  ? 'bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-sm'
                  : 'bg-transparent'
              }
            `}
          />
          <div className="relative">
            <Input
              type="text"
              inputMode="numeric"
              pattern="\d{5}"
              placeholder="Enter ZIP code"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isLoading}
              className={`
                pr-10 h-11
                bg-background/50 backdrop-blur-sm
                border-border/50
                transition-all duration-300 ease-out
                hover:bg-background/60 hover:border-border/70
                focus:bg-background/70 focus:border-primary/50
                focus:shadow-lg focus:shadow-primary/10
                placeholder:transition-all placeholder:duration-300
                ${isFocused ? 'placeholder:translate-x-1' : ''}
              `}
              aria-label="ZIP code input"
              aria-invalid={!!validationError}
              aria-describedby={validationError ? 'zip-error' : undefined}
            />
            <MapPin
              className={`
                absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2
                transition-all duration-300
                ${
                  isFocused
                    ? 'text-primary scale-110'
                    : 'text-muted-foreground scale-100'
                }
              `}
            />
          </div>
        </div>

        {/* Modern gradient submit button */}
        <Button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className={`
            h-11 px-6
            relative overflow-hidden
            bg-gradient-to-r from-primary via-primary/90 to-primary
            hover:from-primary/90 hover:via-primary hover:to-primary/90
            transition-all duration-300 ease-out
            shadow-lg shadow-primary/20
            hover:shadow-xl hover:shadow-primary/30
            hover:scale-[1.02]
            active:scale-[0.98]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            group
          `}
        >
          <span className="relative z-10 flex items-center gap-2 font-medium">
            {isLoading ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin" />
                Loading
              </>
            ) : (
              'Submit'
            )}
          </span>
          {/* Shimmer effect */}
          <div
            className={`
              absolute inset-0 -translate-x-full
              bg-gradient-to-r from-transparent via-white/20 to-transparent
              group-hover:translate-x-full
              transition-transform duration-700 ease-in-out
            `}
          />
        </Button>

        {/* Recent ZIP codes dropdown with glass style */}
        {recentZipCodes.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={isLoading}
                aria-label="Recent ZIP codes"
                className={`
                  h-11 w-11
                  bg-background/50 backdrop-blur-sm
                  border-border/50
                  hover:bg-background/70 hover:border-border/70
                  hover:scale-105
                  active:scale-95
                  transition-all duration-300 ease-out
                  shadow-md hover:shadow-lg
                `}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-background/95 backdrop-blur-xl border-border/50"
            >
              {recentZipCodes.map((zip) => (
                <DropdownMenuItem
                  key={zip}
                  onClick={() => handleRecentZipClick(zip)}
                  className="cursor-pointer hover:bg-primary/10 transition-colors duration-200"
                >
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  {zip}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </form>

      {/* Elegant error message */}
      {validationError && (
        <div
          id="zip-error"
          role="alert"
          aria-live="polite"
          className={`
            text-sm text-destructive
            bg-destructive/10 border border-destructive/20
            rounded-md px-3 py-2
            animate-in slide-in-from-top-1 duration-300
          `}
        >
          {validationError}
        </div>
      )}
    </div>
  )
}
