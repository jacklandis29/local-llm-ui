import { useEffect } from 'react';

/**
 * Custom hook for registering keyboard shortcuts
 * @param {Object} shortcuts - Map of shortcut configs to handler functions
 * Example: { 'ctrl+n': handleNewChat, 'ctrl+k': handleSearch }
 */
export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      for (const [combo, handler] of Object.entries(shortcuts)) {
        const parts = combo.toLowerCase().split('+');
        const key = parts[parts.length - 1];
        const needsCtrl = parts.includes('ctrl') || parts.includes('cmd');
        const needsShift = parts.includes('shift');
        const needsAlt = parts.includes('alt');

        const ctrlPressed = event.ctrlKey || event.metaKey;
        const shiftPressed = event.shiftKey;
        const altPressed = event.altKey;

        if (
          event.key.toLowerCase() === key &&
          ctrlPressed === needsCtrl &&
          shiftPressed === needsShift &&
          altPressed === needsAlt
        ) {
          event.preventDefault();
          handler(event);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
