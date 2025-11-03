import { useState, useCallback } from 'react';
import { MEMORY_PATTERNS, STORAGE_KEYS } from '../constants';
import { useLocalStorage } from './useLocalStorage';

/**
 * Custom hook for managing shared memory across chats
 * @returns {Object} - { memory, extractMemory, clearMemory, buildMessagesWithContext }
 */
export function useMemory() {
  const [sharedMemory, setSharedMemory] = useLocalStorage(STORAGE_KEYS.MEMORY, []);

  /**
   * Extract key information from messages and add to memory
   */
  const extractMemory = useCallback((userMessage, assistantMessage = '') => {
    const combinedText = `${userMessage} ${assistantMessage}`.toLowerCase();

    for (const pattern of MEMORY_PATTERNS) {
      const match = combinedText.match(pattern.regex);
      if (match && match[1]) {
        const extractedInfo = match[1].trim();

        // Skip if too short or too long (likely false positive)
        if (extractedInfo.length < 2 || extractedInfo.length > 30) continue;

        const memoryContent = pattern.format(extractedInfo);

        // Check if this info is already in memory
        const exists = sharedMemory.some(m => {
          const existingLower = m.content.toLowerCase();
          const newLower = memoryContent.toLowerCase();
          return existingLower === newLower ||
            (existingLower.includes('name is') && newLower.includes('name is') &&
              existingLower.split('name is')[1]?.trim() === newLower.split('name is')[1]?.trim());
        });

        if (!exists) {
          setSharedMemory(prev => {
            // Remove any existing entries of the same type (e.g., only one name)
            if (pattern.type === 'name') {
              const filtered = prev.filter(m => !m.content.toLowerCase().includes('name is'));
              return [
                ...filtered,
                {
                  role: 'system',
                  content: memoryContent,
                  createdAt: new Date().toISOString(),
                }
              ];
            }
            return [
              ...prev,
              {
                role: 'system',
                content: memoryContent,
                createdAt: new Date().toISOString(),
              }
            ];
          });
        }
      }
    }
  }, [sharedMemory, setSharedMemory]);

  /**
   * Build messages array with shared memory context
   */
  const buildMessagesWithContext = useCallback((chatMessages) => {
    const messages = [];

    // Add shared memory context at the beginning
    if (sharedMemory.length > 0) {
      const memoryContent = sharedMemory.map(m => m.content).join('. ') + '.';
      messages.push({
        role: 'system',
        content: `Context from previous conversations: ${memoryContent}`,
      });
    }

    // Add current chat messages
    messages.push(...chatMessages);

    return messages;
  }, [sharedMemory]);

  /**
   * Clear all shared memory
   */
  const clearMemory = useCallback(() => {
    setSharedMemory([]);
  }, [setSharedMemory]);

  return {
    memory: sharedMemory,
    extractMemory,
    clearMemory,
    buildMessagesWithContext,
  };
}
