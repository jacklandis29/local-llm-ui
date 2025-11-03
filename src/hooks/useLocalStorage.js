import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for syncing state with localStorage
 * @param {string} key - The localStorage key
 * @param {*} initialValue - The initial value if no stored value exists
 * @returns {[*, Function]} - Returns [value, setValue] tuple
 */
export function useLocalStorage(key, initialValue) {
  const initializedRef = useRef(false);
  const [storedValue, setStoredValue] = useState(initialValue);

  // Load from localStorage on mount
  useEffect(() => {
    if (initializedRef.current) return;

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
      initializedRef.current = true;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      initializedRef.current = true;
    }
  }, [key]);

  // Save to localStorage when value changes
  useEffect(() => {
    if (!initializedRef.current) return;

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
