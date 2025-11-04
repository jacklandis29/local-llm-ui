// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1234';
export const API_MODEL_NAME = process.env.REACT_APP_MODEL_NAME || ''; // Optional model name
export const API_ENDPOINTS = {
  CHAT_COMPLETIONS: `${API_BASE_URL}/v1/chat/completions`,
};

// Storage Keys
export const STORAGE_KEYS = {
  CHATS: 'local-llm-chats',
  MEMORY: 'local-llm-memory',
  THEME: 'local-llm-theme',
  KNOWLEDGE_BASE: 'local-llm-knowledge-base',
};

// UI Constants
export const TEXTAREA_MAX_HEIGHT = 200;
export const PERFORMANCE_UPDATE_INTERVAL = 500;
export const COPY_FEEDBACK_DURATION = 2000;
export const TITLE_MAX_LENGTH = 50;
export const TITLE_MAX_TOKENS = 20;

// Model Parameters
export const DEFAULT_MODEL_PARAMS = {
  temperature: 0.7,
  maxTokens: 2000,
  stream: true,
};

// Memory Patterns
export const MEMORY_PATTERNS = [
  {
    regex: /my name is ([\w\s]+?)(?:\.|,|\s|$)/i,
    type: 'name',
    format: (match) => `The user's name is ${match.trim()}`
  },
  {
    regex: /i'm ([\w\s]+?)(?:\.|,|\s|$)/i,
    type: 'name',
    format: (match) => `The user's name is ${match.trim()}`
  },
  {
    regex: /i am ([\w\s]+?)(?:\.|,|\s|$)/i,
    type: 'name',
    format: (match) => `The user's name is ${match.trim()}`
  },
  {
    regex: /call me ([\w\s]+?)(?:\.|,|\s|$)/i,
    type: 'name',
    format: (match) => `The user's name is ${match.trim()}`
  },
  {
    regex: /name is ([\w\s]+?)(?:\.|,|\s|$)/i,
    type: 'name',
    format: (match) => `The user's name is ${match.trim()}`
  },
  {
    regex: /i'm called ([\w\s]+?)(?:\.|,|\s|$)/i,
    type: 'name',
    format: (match) => `The user's name is ${match.trim()}`
  },
];

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  NEW_CHAT: { key: 'n', ctrl: true, description: 'New chat' },
  SEARCH: { key: 'k', ctrl: true, description: 'Search' },
  FOCUS_INPUT: { key: 'l', ctrl: true, description: 'Focus input' },
  TOGGLE_SIDEBAR: { key: 'b', ctrl: true, description: 'Toggle sidebar' },
  TOGGLE_THEME: { key: 'd', ctrl: true, description: 'Toggle theme' },
  UPLOAD_FILE: { key: 'u', ctrl: true, description: 'Upload file' },
};

// File Upload
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const KNOWLEDGE_CONTEXT_LIMIT = 5; // Number of files to include in context
export const MAX_CHARS_PER_FILE = 8000; // Max characters per file to send as context
