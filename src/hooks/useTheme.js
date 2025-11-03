import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants';

/**
 * Custom hook for managing theme (light/dark mode)
 * @returns {[string, Function]} - Returns [theme, toggleTheme]
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    return savedTheme || 'dark';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  return [theme, toggleTheme];
}
