import { useState, useEffect, useCallback } from 'react'

// Type-safe localStorage hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Check if window is available (SSR-safe)
  const isClient = typeof window !== 'undefined'

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!isClient) {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (!isClient) {
        console.warn('localStorage is not available')
        return
      }

      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value

        // Save state
        setStoredValue(valueToStore)

        // Save to localStorage
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue, isClient]
  )

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    if (!isClient) {
      console.warn('localStorage is not available')
      return
    }

    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue, isClient])

  // Listen for changes in other tabs/windows
  useEffect(() => {
    if (!isClient) {
      return
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.warn(`Error parsing localStorage value for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [key, isClient])

  return [storedValue, setValue, removeValue] as const
}