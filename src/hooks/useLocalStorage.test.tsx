import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear all console warnings
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial value setting', () => {
    it('should return initial value when localStorage is empty', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      expect(result.current[0]).toBe('initial');
    });

    it('should return stored value from localStorage when it exists', () => {
      localStorage.setItem('test-key', JSON.stringify('stored-value'));

      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      expect(result.current[0]).toBe('stored-value');
    });

    it('should handle complex initial objects', () => {
      const initialObject = {
        name: 'Test',
        count: 42,
        nested: { value: true },
      };

      const { result } = renderHook(() => useLocalStorage('test-key', initialObject));

      expect(result.current[0]).toEqual(initialObject);
    });

    it('should handle arrays as initial values', () => {
      const initialArray = [1, 2, 3, 4, 5];

      const { result } = renderHook(() => useLocalStorage('test-key', initialArray));

      expect(result.current[0]).toEqual(initialArray);
    });

    it('should handle boolean initial values', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', true));

      expect(result.current[0]).toBe(true);
    });

    it('should handle number initial values', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 123));

      expect(result.current[0]).toBe(123);
    });

    it('should handle null as initial value', () => {
      const { result } = renderHook(() => useLocalStorage<string | null>('test-key', null));

      expect(result.current[0]).toBeNull();
    });
  });

  describe('Value updates', () => {
    it('should update state when setValue is called', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      act(() => {
        result.current[1]('updated');
      });

      expect(result.current[0]).toBe('updated');
    });

    it('should update localStorage when setValue is called', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      act(() => {
        result.current[1]('updated');
      });

      expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'));
    });

    it('should handle functional updates', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 10));

      act(() => {
        result.current[1]((prev) => prev + 5);
      });

      expect(result.current[0]).toBe(15);
      expect(localStorage.getItem('test-key')).toBe('15');
    });

    it('should update complex objects', () => {
      const initial = { count: 0, name: 'test' };
      const { result } = renderHook(() => useLocalStorage('test-key', initial));

      act(() => {
        result.current[1]({ count: 1, name: 'updated' });
      });

      expect(result.current[0]).toEqual({ count: 1, name: 'updated' });
      expect(JSON.parse(localStorage.getItem('test-key')!)).toEqual({
        count: 1,
        name: 'updated',
      });
    });

    it('should update arrays', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', [1, 2, 3]));

      act(() => {
        result.current[1]([4, 5, 6]);
      });

      expect(result.current[0]).toEqual([4, 5, 6]);
      expect(JSON.parse(localStorage.getItem('test-key')!)).toEqual([4, 5, 6]);
    });

    it('should handle multiple sequential updates', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 0));

      act(() => {
        result.current[1](1);
      });
      expect(result.current[0]).toBe(1);

      act(() => {
        result.current[1](2);
      });
      expect(result.current[0]).toBe(2);

      act(() => {
        result.current[1](3);
      });
      expect(result.current[0]).toBe(3);

      expect(localStorage.getItem('test-key')).toBe('3');
    });
  });

  describe('localStorage synchronization', () => {
    it('should persist string values to localStorage', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', ''));

      act(() => {
        result.current[1]('test-string');
      });

      const storedValue = localStorage.getItem('test-key');
      expect(storedValue).toBe(JSON.stringify('test-string'));
    });

    it('should persist number values to localStorage', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 0));

      act(() => {
        result.current[1](42);
      });

      const storedValue = localStorage.getItem('test-key');
      expect(storedValue).toBe('42');
      expect(JSON.parse(storedValue!)).toBe(42);
    });

    it('should persist boolean values to localStorage', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', false));

      act(() => {
        result.current[1](true);
      });

      const storedValue = localStorage.getItem('test-key');
      expect(storedValue).toBe('true');
      expect(JSON.parse(storedValue!)).toBe(true);
    });

    it('should persist objects to localStorage as JSON', () => {
      const { result } = renderHook(() =>
        useLocalStorage('test-key', { name: '', age: 0 })
      );

      act(() => {
        result.current[1]({ name: 'John', age: 30 });
      });

      const storedValue = localStorage.getItem('test-key');
      expect(JSON.parse(storedValue!)).toEqual({ name: 'John', age: 30 });
    });

    it('should persist arrays to localStorage as JSON', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', [] as number[]));

      act(() => {
        result.current[1]([1, 2, 3, 4, 5]);
      });

      const storedValue = localStorage.getItem('test-key');
      expect(JSON.parse(storedValue!)).toEqual([1, 2, 3, 4, 5]);
    });

    it('should read existing values from localStorage on mount', () => {
      const existingData = { id: 123, active: true };
      localStorage.setItem('test-key', JSON.stringify(existingData));

      const { result } = renderHook(() => useLocalStorage('test-key', { id: 0, active: false }));

      expect(result.current[0]).toEqual(existingData);
    });
  });

  describe('JSON serialization/deserialization', () => {
    it('should handle nested objects correctly', () => {
      const complex = {
        user: {
          name: 'John',
          preferences: {
            theme: 'dark',
            notifications: true,
          },
        },
        settings: ['a', 'b', 'c'],
      };

      const { result } = renderHook(() => useLocalStorage('test-key', complex));

      act(() => {
        result.current[1](complex);
      });

      // Re-render to ensure deserialization works
      const { result: result2 } = renderHook(() => useLocalStorage('test-key', {}));

      expect(result2.current[0]).toEqual(complex);
    });

    it('should handle arrays of objects', () => {
      const data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ];

      const { result } = renderHook(() => useLocalStorage('test-key', data));

      act(() => {
        result.current[1](data);
      });

      const stored = JSON.parse(localStorage.getItem('test-key')!);
      expect(stored).toEqual(data);
      expect(result.current[0]).toEqual(data);
    });

    it('should handle special string values that look like JSON', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', ''));

      act(() => {
        result.current[1]('{"not": "parsed"}');
      });

      // The string itself should be stored, not parsed as an object
      expect(result.current[0]).toBe('{"not": "parsed"}');
    });

    it('should preserve data types through serialization cycle', () => {
      const data = {
        string: 'text',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        object: { nested: 'value' },
      };

      const { result } = renderHook(() => useLocalStorage('test-key', data));

      act(() => {
        result.current[1](data);
      });

      expect(result.current[0]).toEqual(data);
      expect(typeof result.current[0].string).toBe('string');
      expect(typeof result.current[0].number).toBe('number');
      expect(typeof result.current[0].boolean).toBe('boolean');
      expect(result.current[0].null).toBeNull();
      expect(Array.isArray(result.current[0].array)).toBe(true);
      expect(typeof result.current[0].object).toBe('object');
    });
  });

  describe('Cross-tab synchronization with storage events', () => {
    it('should update state when storage event is fired with new value', async () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      expect(result.current[0]).toBe('initial');

      // Simulate storage event from another tab
      act(() => {
        const event = new StorageEvent('storage', {
          key: 'test-key',
          newValue: JSON.stringify('updated-from-another-tab'),
          oldValue: JSON.stringify('initial'),
        });
        window.dispatchEvent(event);
      });

      await waitFor(() => {
        expect(result.current[0]).toBe('updated-from-another-tab');
      });
    });

    it('should handle storage events with object values', async () => {
      const initial = { count: 0 };
      const updated = { count: 10 };

      const { result } = renderHook(() => useLocalStorage('test-key', initial));

      act(() => {
        const event = new StorageEvent('storage', {
          key: 'test-key',
          newValue: JSON.stringify(updated),
          oldValue: JSON.stringify(initial),
        });
        window.dispatchEvent(event);
      });

      await waitFor(() => {
        expect(result.current[0]).toEqual(updated);
      });
    });

    it('should ignore storage events for different keys', async () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      act(() => {
        const event = new StorageEvent('storage', {
          key: 'different-key',
          newValue: JSON.stringify('should-be-ignored'),
          oldValue: null,
        });
        window.dispatchEvent(event);
      });

      // Wait a bit to ensure no update happens
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(result.current[0]).toBe('initial');
    });

    it('should not update when storage event has null newValue', async () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      act(() => {
        const event = new StorageEvent('storage', {
          key: 'test-key',
          newValue: null,
          oldValue: JSON.stringify('initial'),
        });
        window.dispatchEvent(event);
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(result.current[0]).toBe('initial');
    });

    it('should clean up event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useLocalStorage('test-key', 'initial'));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
    });
  });

  describe('Error handling for invalid JSON', () => {
    it('should return initial value when localStorage contains invalid JSON', () => {
      localStorage.setItem('test-key', 'invalid-json{not-valid');

      const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));

      expect(result.current[0]).toBe('fallback');
      expect(console.warn).toHaveBeenCalledWith(
        'Error reading localStorage key "test-key":',
        expect.any(Error)
      );
    });

    it('should handle malformed JSON in storage events gracefully', async () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      act(() => {
        const event = new StorageEvent('storage', {
          key: 'test-key',
          newValue: 'invalid{json',
          oldValue: null,
        });
        window.dispatchEvent(event);
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should keep the current value and log warning
      expect(result.current[0]).toBe('initial');
      expect(console.warn).toHaveBeenCalledWith(
        'Error parsing localStorage value for key "test-key":',
        expect.any(Error)
      );
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('test-key', '{broken: json}');

      const { result } = renderHook(() =>
        useLocalStorage('test-key', { name: 'default', value: 0 })
      );

      expect(result.current[0]).toEqual({ name: 'default', value: 0 });
    });
  });

  describe('SSR safety (no window object)', () => {
    it('should detect when client-side rendering is available', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

      // In jsdom, window should be available
      expect(typeof window).toBe('object');
      expect(result.current[0]).toBe('default');
    });

    it('should handle localStorage operations in browser environment', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      // Should work normally in browser/jsdom environment
      act(() => {
        result.current[1]('updated');
      });

      expect(result.current[0]).toBe('updated');
      expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'));
    });

    it('should use localStorage when available', () => {
      // Ensure localStorage is available
      expect(typeof window.localStorage).toBe('object');

      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      act(() => {
        result.current[1]('test-value');
      });

      // Verify it's actually using localStorage
      expect(window.localStorage.getItem('test-key')).toBe(JSON.stringify('test-value'));
    });
  });

  describe('Remove value functionality', () => {
    it('should remove value from localStorage', () => {
      localStorage.setItem('test-key', JSON.stringify('stored'));

      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      expect(result.current[0]).toBe('stored');

      act(() => {
        result.current[2]();
      });

      expect(localStorage.getItem('test-key')).toBeNull();
    });

    it('should reset state to initial value when removed', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      act(() => {
        result.current[1]('updated');
      });

      expect(result.current[0]).toBe('updated');

      act(() => {
        result.current[2]();
      });

      expect(result.current[0]).toBe('initial');
    });

    it('should handle removing non-existent key', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      act(() => {
        result.current[2]();
      });

      expect(localStorage.getItem('test-key')).toBeNull();
      expect(result.current[0]).toBe('initial');
    });

    it('should reset complex objects to initial value', () => {
      const initial = { count: 0, name: 'default' };
      const { result } = renderHook(() => useLocalStorage('test-key', initial));

      act(() => {
        result.current[1]({ count: 10, name: 'updated' });
      });

      expect(result.current[0]).toEqual({ count: 10, name: 'updated' });

      act(() => {
        result.current[2]();
      });

      expect(result.current[0]).toEqual(initial);
      expect(localStorage.getItem('test-key')).toBeNull();
    });

    it('should reset arrays to initial value', () => {
      const initial = [1, 2, 3];
      const { result } = renderHook(() => useLocalStorage('test-key', initial));

      act(() => {
        result.current[1]([4, 5, 6]);
      });

      act(() => {
        result.current[2]();
      });

      expect(result.current[0]).toEqual(initial);
    });
  });

  describe('Different data types', () => {
    it('should handle strings correctly', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'hello'));

      act(() => {
        result.current[1]('world');
      });

      expect(result.current[0]).toBe('world');
      expect(typeof result.current[0]).toBe('string');
    });

    it('should handle numbers correctly', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 0));

      act(() => {
        result.current[1](42.5);
      });

      expect(result.current[0]).toBe(42.5);
      expect(typeof result.current[0]).toBe('number');
    });

    it('should handle objects correctly', () => {
      const obj = { name: 'test', value: 123 };
      const { result } = renderHook(() => useLocalStorage('test-key', obj));

      act(() => {
        result.current[1]({ name: 'updated', value: 456 });
      });

      expect(result.current[0]).toEqual({ name: 'updated', value: 456 });
      expect(typeof result.current[0]).toBe('object');
    });

    it('should handle arrays correctly', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', [1, 2, 3]));

      act(() => {
        result.current[1]([4, 5, 6, 7]);
      });

      expect(result.current[0]).toEqual([4, 5, 6, 7]);
      expect(Array.isArray(result.current[0])).toBe(true);
    });

    it('should handle booleans correctly', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', false));

      act(() => {
        result.current[1](true);
      });

      expect(result.current[0]).toBe(true);
      expect(typeof result.current[0]).toBe('boolean');
    });

    it('should handle null correctly', () => {
      const { result } = renderHook(() => useLocalStorage<string | null>('test-key', null));

      expect(result.current[0]).toBeNull();

      act(() => {
        result.current[1]('not-null');
      });

      expect(result.current[0]).toBe('not-null');

      act(() => {
        result.current[1](null);
      });

      expect(result.current[0]).toBeNull();
    });

    it('should handle undefined gracefully by using initial value', () => {
      const { result } = renderHook(() =>
        useLocalStorage<string | undefined>('test-key', 'initial')
      );

      expect(result.current[0]).toBe('initial');
    });

    it('should handle mixed type arrays', () => {
      const mixed = ['string', 42, true, null, { key: 'value' }];
      const { result } = renderHook(() => useLocalStorage('test-key', mixed));

      act(() => {
        result.current[1](mixed);
      });

      expect(result.current[0]).toEqual(mixed);
    });
  });

  describe('Multiple instances with same key', () => {
    it('should sync multiple hook instances with the same key', () => {
      const { result: result1 } = renderHook(() => useLocalStorage('shared-key', 'initial'));
      const { result: result2 } = renderHook(() => useLocalStorage('shared-key', 'initial'));

      expect(result1.current[0]).toBe('initial');
      expect(result2.current[0]).toBe('initial');

      act(() => {
        result1.current[1]('updated');
      });

      // Both should reflect the localStorage change
      expect(result1.current[0]).toBe('updated');
      expect(localStorage.getItem('shared-key')).toBe(JSON.stringify('updated'));
    });

    it('should handle different keys independently', () => {
      const { result: result1 } = renderHook(() => useLocalStorage('key1', 'value1'));
      const { result: result2 } = renderHook(() => useLocalStorage('key2', 'value2'));

      act(() => {
        result1.current[1]('updated1');
      });

      expect(result1.current[0]).toBe('updated1');
      expect(result2.current[0]).toBe('value2');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string key', () => {
      const { result } = renderHook(() => useLocalStorage('', 'value'));

      act(() => {
        result.current[1]('updated');
      });

      expect(result.current[0]).toBe('updated');
      expect(localStorage.getItem('')).toBe(JSON.stringify('updated'));
    });

    it('should handle very long keys', () => {
      const longKey = 'a'.repeat(1000);
      const { result } = renderHook(() => useLocalStorage(longKey, 'value'));

      act(() => {
        result.current[1]('updated');
      });

      expect(result.current[0]).toBe('updated');
      expect(localStorage.getItem(longKey)).toBe(JSON.stringify('updated'));
    });

    it('should handle large data objects', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        data: `item-${i}`,
      }));

      const { result } = renderHook(() => useLocalStorage('test-key', largeArray));

      act(() => {
        result.current[1](largeArray);
      });

      expect(result.current[0]).toHaveLength(1000);
      expect(result.current[0][500]).toEqual({ id: 500, data: 'item-500' });
    });

    it('should handle rapid consecutive updates', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 0));

      act(() => {
        for (let i = 1; i <= 100; i++) {
          result.current[1](i);
        }
      });

      expect(result.current[0]).toBe(100);
      expect(localStorage.getItem('test-key')).toBe('100');
    });

    it('should handle special characters in string values', () => {
      const specialString = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/`~\n\t\r';
      const { result } = renderHook(() => useLocalStorage('test-key', ''));

      act(() => {
        result.current[1](specialString);
      });

      expect(result.current[0]).toBe(specialString);

      // Re-render to ensure it persists correctly
      const { result: result2 } = renderHook(() => useLocalStorage('test-key', ''));
      expect(result2.current[0]).toBe(specialString);
    });

    it('should handle emoji and unicode characters', () => {
      const emojiString = '😀 👍 🎉 日本語 中文 한글';
      const { result } = renderHook(() => useLocalStorage('test-key', ''));

      act(() => {
        result.current[1](emojiString);
      });

      expect(result.current[0]).toBe(emojiString);
    });

    it('should handle Date objects by converting to string', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const { result } = renderHook(() => useLocalStorage('test-key', date));

      act(() => {
        result.current[1](date);
      });

      // Date objects get serialized to ISO strings in JSON and stored as strings
      const storedValue = localStorage.getItem('test-key');
      expect(storedValue).toBe(JSON.stringify(date.toISOString()));

      // When retrieved, they come back as ISO strings, not Date objects
      const { result: result2 } = renderHook(() => useLocalStorage('test-key', new Date()));
      expect(result2.current[0]).toBe(date.toISOString());
      expect(typeof result2.current[0]).toBe('string');
    });

    it('should handle updating the same value multiple times', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      act(() => {
        result.current[1]('value');
      });

      act(() => {
        result.current[1]('value');
      });

      act(() => {
        result.current[1]('value');
      });

      expect(result.current[0]).toBe('value');
      expect(localStorage.getItem('test-key')).toBe(JSON.stringify('value'));
    });
  });
});
