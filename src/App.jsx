import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';
import MarkdownRenderer from './components/MarkdownRenderer';
import PerformanceBar from './components/PerformanceBar';
import KnowledgeBaseModal from './components/KnowledgeBaseModal';
import ContextMenu from './components/ContextMenu';
import EmptyState from './components/EmptyState';
import InputBox from './components/InputBox';
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
  const [selectedImages, setSelectedImages] = useState([]); // For multi-modal support
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

  // Context menu state
  const [contextMenu, setContextMenu] = useState(null); // { chatId, position: { top, left } }

  // Rename modal state
  const [renameModal, setRenameModal] = useState(null); // { chatId, currentName }

  // Refs
  const messagesEndRef = useRef(null);
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

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+n': handleNewChat,
    'ctrl+k': () => console.log('Search not yet implemented'),
    'ctrl+b': () => setSidebarCollapsed(prev => !prev),
    'ctrl+d': toggleTheme,
    'ctrl+u': () => setIsKnowledgeBaseOpen(true),
  });

  // Image paste handler
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleImageFile(file);
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  // Image handling functions
  const handleImageFile = async (file) => {
    if (!file.type.startsWith('image/')) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setSelectedImages(prev => [...prev, {
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type,
        data: base64,
        size: file.size,
      }]);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => handleImageFile(file));
    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const removeImage = (imageId) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
  };

  // Helper functions
  function createChatObject(title = 'New Chat') {
    return {
      id: Date.now(),
      title,
      messages: [],
      createdAt: new Date().toISOString(),
      starred: false,
      projectId: null,
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

  // Context menu handlers
  const handleContextMenu = (event, chatId) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setContextMenu({
      chatId,
      position: {
        top: rect.bottom + 4,
        left: rect.left,
      },
    });
  };

  const handleStarChat = (chatId) => {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId ? { ...chat, starred: !chat.starred } : chat
      )
    );
  };

  const handleRenameChat = (chatId) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setRenameModal({ chatId, currentName: chat.title });
    }
  };

  const handleRenameSubmit = (newName) => {
    if (renameModal && newName.trim()) {
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === renameModal.chatId ? { ...chat, title: newName.trim() } : chat
        )
      );
    }
    setRenameModal(null);
  };

  const handleAddToProject = (chatId) => {
    // Placeholder for future project functionality
    console.log('Add to project:', chatId);
    alert('Project functionality coming soon!');
  };

  const handleActionClick = (actionId) => {
    // Handle action button clicks from EmptyState
    const actionPrompts = {
      write: "Help me write something...",
      learn: "Teach me about...",
      code: "Help me code...",
      life: "Give me advice on...",
      surprise: "Surprise me with something interesting!",
    };

    const prompt = actionPrompts[actionId] || "";
    setInput(prompt);
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
    if ((!messageContent && selectedImages.length === 0) || isLoading) return;

    const currentChat = getCurrentChat();
    if (!currentChat) return;

    setInput('');
    setIsLoading(true);
    setPerformance({ tokensPerSecond: null, totalTokens: null, responseTime: null, isStreaming: true });

    // Extract memory from user message
    extractMemory(messageContent, '');

    // Create user message with optional images
    let userMessage;
    if (selectedImages.length > 0) {
      // Multi-modal format (OpenAI vision API)
      userMessage = {
        role: 'user',
        content: [
          { type: 'text', text: messageContent || 'What is in this image?' },
          ...selectedImages.map(img => ({
            type: 'image_url',
            image_url: { url: img.data }
          }))
        ],
        images: selectedImages, // Store for display in UI
      };
    } else {
      // Text-only message
      userMessage = { role: 'user', content: messageContent };
    }

    // Clear selected images
    const imagesToSend = [...selectedImages];
    setSelectedImages([]);

    // Use existing messages or add new user message
    const updatedMessages = existingMessages
      ? existingMessages
      : [...currentChat.messages, userMessage];

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

        {!sidebarCollapsed && <div className="chat-list-label">Recents</div>}

        <div className="chat-list">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${chat.id === currentChatId ? 'active' : ''} ${chat.starred ? 'starred' : ''}`}
              onClick={() => setCurrentChatId(chat.id)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              {!sidebarCollapsed && (
                <>
                  <span className="chat-title">
                    {chat.starred && (
                      <svg className="star-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    )}
                    {chat.title}
                  </span>
                  <button
                    className="chat-menu-btn"
                    onClick={(e) => handleContextMenu(e, chat.id)}
                    title="More options"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="12" cy="5" r="1"></circle>
                      <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                  </button>
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
        {currentChat && currentChat.messages.length === 0 ? (
          // Empty state with centered input
          <EmptyState
            input={input}
            setInput={setInput}
            onSend={() => handleSendMessage()}
            isLoading={isLoading}
            selectedImages={selectedImages}
            onRemoveImage={removeImage}
            onImageUpload={handleImageUpload}
            onActionClick={handleActionClick}
          />
        ) : (
          // Active chat with messages and bottom input
          <>
            <div className="messages-container">
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
                        {/* Display images if present (for user messages) */}
                        {message.images && message.images.length > 0 && (
                          <div className="message-images">
                            {message.images.map((img, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={img.data}
                                alt={img.name || 'Uploaded image'}
                                className="message-image"
                              />
                            ))}
                          </div>
                        )}

                        {/* Display text content */}
                        {message.content ? (
                          message.role === 'assistant' ? (
                            <>
                              <MarkdownRenderer content={message.content} />
                              {isLoading && message.id && (
                                <span className="streaming-cursor">▋</span>
                              )}
                            </>
                          ) : (
                            <div className="message-text">
                              {typeof message.content === 'string'
                                ? message.content
                                : message.content.find(c => c.type === 'text')?.text || ''}
                            </div>
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
            </div>

            {/* Performance bar */}
            <PerformanceBar
              tokensPerSecond={performance.tokensPerSecond}
              totalTokens={performance.totalTokens}
              responseTime={performance.responseTime}
              isStreaming={performance.isStreaming}
            />

            {/* Input at bottom for active chat */}
            <InputBox
              input={input}
              setInput={setInput}
              onSend={() => handleSendMessage()}
              isLoading={isLoading}
              centered={false}
              selectedImages={selectedImages}
              onRemoveImage={removeImage}
              onImageUpload={handleImageUpload}
            />
          </>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          chat={chats.find(c => c.id === contextMenu.chatId)}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onStar={handleStarChat}
          onRename={handleRenameChat}
          onAddToProject={handleAddToProject}
          onDelete={deleteChat}
        />
      )}

      {/* Rename Modal */}
      {renameModal && (
        <div className="modal-overlay" onClick={() => setRenameModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Rename chat</h3>
            <input
              type="text"
              defaultValue={renameModal.currentName}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleRenameSubmit(e.target.value);
                }
              }}
              autoFocus
              placeholder="Enter new name"
            />
            <div className="modal-actions">
              <button onClick={() => setRenameModal(null)}>Cancel</button>
              <button
                className="primary"
                onClick={(e) => {
                  const input = e.target.closest('.modal-content').querySelector('input');
                  handleRenameSubmit(input.value);
                }}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

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
