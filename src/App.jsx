import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';
import MarkdownRenderer from './components/MarkdownRenderer';
import PerformanceBar from './components/PerformanceBar';
import KnowledgeBaseModal from './components/KnowledgeBaseModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useMemory } from './hooks/useMemory';
import { useKnowledgeBase } from './hooks/useKnowledgeBase';
import { STORAGE_KEYS, TEXTAREA_MAX_HEIGHT, KNOWLEDGE_CONTEXT_LIMIT, MAX_CHARS_PER_FILE } from './constants';
import { streamChatCompletion, generateChatTitle, exportChat, downloadFile } from './utils/chatUtils';

function App() {
  // State management with custom hooks
  const [chats, setChats] = useLocalStorage(STORAGE_KEYS.CHATS, []);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [performance, setPerformance] = useState({
    tokensPerSecond: null,
    totalTokens: null,
    responseTime: null,
    isStreaming: false,
  });

  // Custom hooks
  const [theme, toggleTheme] = useTheme();
  const { extractMemory, buildMessagesWithContext } = useMemory();
  const {
    knowledgeBase,
    isProcessing,
    processingStatus,
    addFiles,
    removeFile,
    getKnowledgeContext,
  } = useKnowledgeBase();

  // Knowledge base modal state
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const initializedRef = useRef(false);

  // Initialize: Create first chat if none exists
  useEffect(() => {
    if (initializedRef.current) return;

    if (chats.length === 0) {
      const newChat = createChatObject();
      setChats([newChat]);
      setCurrentChatId(newChat.id);
    } else {
      setCurrentChatId(chats[0].id);
    }

    initializedRef.current = true;
  }, [chats, setChats]);

  // Auto-scroll to bottom (optimized to prevent glitching)
  const scrollToBottom = useCallback((smooth = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
    }
  }, []);

  // Only scroll on chat change, not during streaming
  useEffect(() => {
    if (!isLoading) {
      scrollToBottom(true);
    }
  }, [currentChatId, scrollToBottom, isLoading]);

  // Dynamic textarea resizing (optimized with requestAnimationFrame)
  useEffect(() => {
    if (textareaRef.current) {
      // Use RAF to prevent layout thrashing
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          const scrollHeight = textareaRef.current.scrollHeight;
          textareaRef.current.style.height = `${Math.min(scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
        }
      });
    }
  }, [input]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+n': handleNewChat,
    'ctrl+k': () => console.log('Search not yet implemented'),
    'ctrl+l': () => textareaRef.current?.focus(),
    'ctrl+b': () => setSidebarCollapsed(prev => !prev),
    'ctrl+d': toggleTheme,
    'ctrl+u': () => setIsKnowledgeBaseOpen(true),
  });

  // Helper functions
  function createChatObject(title = 'New Chat') {
    return {
      id: Date.now(),
      title,
      messages: [],
      createdAt: new Date().toISOString(),
    };
  }

  function getCurrentChat() {
    return chats.find(chat => chat.id === currentChatId);
  }

  function updateCurrentChat(updateFn) {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === currentChatId ? updateFn(chat) : chat
      )
    );
  }

  // Chat operations
  function handleNewChat() {
    const newChat = createChatObject();
    setChats(prevChats => [newChat, ...prevChats]);
    setCurrentChatId(newChat.id);
  }

  const deleteChat = (chatId) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    if (currentChatId === chatId) {
      setCurrentChatId(updatedChats.length > 0 ? updatedChats[0].id : null);
    }
  };

  const handleExportChat = useCallback((format = 'json') => {
    const currentChat = getCurrentChat();
    if (!currentChat) return;

    const content = exportChat(currentChat, format);
    const filename = `${currentChat.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.${format === 'markdown' ? 'md' : format}`;
    const mimeType = format === 'json' ? 'application/json' : 'text/plain';

    downloadFile(content, filename, mimeType);
  }, [currentChatId, chats]);

  const regenerateLastMessage = useCallback(() => {
    const currentChat = getCurrentChat();
    if (!currentChat || currentChat.messages.length < 2) return;

    // Remove the last assistant message
    const messagesWithoutLast = currentChat.messages.slice(0, -1);

    // Get the last user message
    const lastUserMessage = messagesWithoutLast[messagesWithoutLast.length - 1];
    if (lastUserMessage?.role !== 'user') return;

    // Update chat to remove last message
    updateCurrentChat(chat => ({ ...chat, messages: messagesWithoutLast }));

    // Re-send the last user message
    handleSendMessage(lastUserMessage.content, messagesWithoutLast);
  }, [currentChatId, chats]);

  // Knowledge base operations
  const handleAddFiles = async (files) => {
    const { results, errors } = await addFiles(files);

    if (errors.length > 0) {
      alert(`Some files failed to upload:\n${errors.map(e => `${e.file}: ${e.error}`).join('\n')}`);
    }

    return results;
  };

  const handleRemoveFile = (fileId) => {
    removeFile(fileId);
  };

  // Message sending
  const handleSendMessage = async (messageContent = input.trim(), existingMessages = null) => {
    if (!messageContent || isLoading) return;

    const currentChat = getCurrentChat();
    if (!currentChat) return;

    setInput('');
    setIsLoading(true);
    setPerformance({ tokensPerSecond: null, totalTokens: null, responseTime: null, isStreaming: true });

    // Extract memory from user message
    extractMemory(messageContent, '');

    // Use existing messages or add new user message
    const updatedMessages = existingMessages
      ? existingMessages
      : [...currentChat.messages, { role: 'user', content: messageContent }];

    const isFirstMessage = currentChat.messages.length === 0;

    // Update chat with user message
    updateCurrentChat(chat => ({ ...chat, messages: updatedMessages }));

    // Add empty assistant message for streaming
    const assistantMessageId = Date.now();
    updateCurrentChat(chat => ({
      ...chat,
      messages: [...updatedMessages, { role: 'assistant', content: '', id: assistantMessageId }]
    }));

    // Build messages with context (memory + knowledge base)
    let messagesWithContext = buildMessagesWithContext(updatedMessages);

    // Add knowledge base context if files are available
    if (knowledgeBase.length > 0) {
      const knowledgeContext = getKnowledgeContext(KNOWLEDGE_CONTEXT_LIMIT, MAX_CHARS_PER_FILE);
      // Insert knowledge base as a system message at the start
      messagesWithContext = [
        {
          role: 'system',
          content: knowledgeContext
        },
        ...messagesWithContext
      ];
    }

    // Stream completion
    let lastContent = '';
    let lastUpdateTime = Date.now();

    await streamChatCompletion(
      messagesWithContext,
      // onChunk
      ({ content, tokenCount, tokensPerSecond, responseTime }) => {
        lastContent = content;

        // Update message content
        updateCurrentChat(chat => ({
          ...chat,
          messages: chat.messages.map(msg =>
            msg.id === assistantMessageId ? { ...msg, content } : msg
          )
        }));

        // Update performance (throttled)
        const now = Date.now();
        if (now - lastUpdateTime > 500) {
          setPerformance({
            tokensPerSecond,
            totalTokens: tokenCount,
            responseTime,
            isStreaming: true,
          });
          lastUpdateTime = now;
          // Throttled instant scroll during streaming
          scrollToBottom(false);
        }
      },
      // onComplete
      ({ content, tokensPerSecond, totalTokens, responseTime }) => {
        // Remove the streaming ID
        updateCurrentChat(chat => ({
          ...chat,
          messages: chat.messages.map(msg =>
            msg.id === assistantMessageId ? { ...msg, content, id: undefined } : msg
          )
        }));

        // Extract memory from response
        extractMemory(messageContent, content);

        // Generate title if first message
        if (isFirstMessage) {
          generateChatTitle(messageContent, content).then(title => {
            updateCurrentChat(chat =>
              chat.title === 'New Chat' ? { ...chat, title } : chat
            );
          });
        }

        // Final performance update
        setPerformance({
          tokensPerSecond,
          totalTokens,
          responseTime,
          isStreaming: false,
        });

        setIsLoading(false);
      },
      // onError
      (error) => {
        console.error('Error:', error);

        updateCurrentChat(chat => ({
          ...chat,
          messages: chat.messages.map(msg =>
            msg.id === assistantMessageId
              ? {
                  role: 'assistant',
                  content: `❌ Error: ${error.message}\n\nMake sure LM Studio server is running and a model is loaded.`,
                  id: undefined
                }
              : msg
          )
        }));

        setPerformance({
          tokensPerSecond: null,
          totalTokens: null,
          responseTime: null,
          isStreaming: false,
        });

        setIsLoading(false);
      }
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentChat = getCurrentChat();

  return (
    <div className="app">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={handleNewChat} title="New chat (Ctrl+N)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {!sidebarCollapsed && <span>New chat</span>}
          </button>
          {!sidebarCollapsed && (
            <>
              <button
                className="theme-toggle-btn"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode (Ctrl+D)`}
              >
                {theme === 'dark' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )}
              </button>
              <button
                className="knowledge-base-btn"
                onClick={() => setIsKnowledgeBaseOpen(true)}
                title="Knowledge Base (Ctrl+U)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                {knowledgeBase.length > 0 && (
                  <span className="knowledge-base-badge">{knowledgeBase.length}</span>
                )}
              </button>
            </>
          )}
        </div>

        <div className="chat-list">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${chat.id === currentChatId ? 'active' : ''}`}
              onClick={() => setCurrentChatId(chat.id)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              {!sidebarCollapsed && (
                <>
                  <span className="chat-title">{chat.title}</span>
                  <div className="chat-actions">
                    <button
                      className="chat-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportChat('json');
                      }}
                      title="Export chat"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </button>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      title="Delete chat"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar collapse button */}
      <button
        className="collapse-btn"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        title={`${sidebarCollapsed ? 'Expand' : 'Collapse'} sidebar (Ctrl+B)`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d={sidebarCollapsed ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"}></path>
        </svg>
      </button>

      {/* Main content */}
      <div className="main-content">
        <div className="messages-container">
          {currentChat && currentChat.messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"></path>
                  <path d="M12 6v6l4 2"></path>
                </svg>
              </div>
              <h2>How can I help you today?</h2>
              <div className="keyboard-shortcuts-hint">
                <p>Keyboard shortcuts:</p>
                <ul>
                  <li><kbd>Ctrl+N</kbd> New chat</li>
                  <li><kbd>Ctrl+D</kbd> Toggle theme</li>
                  <li><kbd>Ctrl+B</kbd> Toggle sidebar</li>
                  <li><kbd>Ctrl+L</kbd> Focus input</li>
                  <li><kbd>Ctrl+U</kbd> Knowledge base</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="messages">
              {currentChat?.messages.map((message, index) => (
                <div key={index} className={`message-row ${message.role}`}>
                  <div className="message-wrapper">
                    <div className="message-avatar">
                      {message.role === 'user' ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                        </svg>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      )}
                    </div>
                    <div className="message-content">
                      {message.content ? (
                        message.role === 'assistant' ? (
                          <>
                            <MarkdownRenderer content={message.content} />
                            {isLoading && message.id && (
                              <span className="streaming-cursor">▋</span>
                            )}
                          </>
                        ) : (
                          <div className="message-text">{message.content}</div>
                        )
                      ) : isLoading && message.role === 'assistant' ? (
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      ) : null}
                    </div>
                    {message.role === 'assistant' && !isLoading && index === currentChat.messages.length - 1 && (
                      <button
                        className="regenerate-btn"
                        onClick={regenerateLastMessage}
                        title="Regenerate response"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="23 4 23 10 17 10"></polyline>
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="input-area">
          <PerformanceBar
            tokensPerSecond={performance.tokensPerSecond}
            totalTokens={performance.totalTokens}
            responseTime={performance.responseTime}
            isStreaming={performance.isStreaming}
          />
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message..."
              rows="1"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim()}
              className="send-btn"
              title="Send message (Enter)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Knowledge Base Modal */}
      <KnowledgeBaseModal
        isOpen={isKnowledgeBaseOpen}
        onClose={() => setIsKnowledgeBaseOpen(false)}
        knowledgeBase={knowledgeBase}
        onAddFiles={handleAddFiles}
        onRemoveFile={handleRemoveFile}
        isProcessing={isProcessing}
        processingStatus={processingStatus}
      />
    </div>
  );
}

export default App;
