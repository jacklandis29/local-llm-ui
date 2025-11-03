import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import MarkdownRenderer from './components/MarkdownRenderer';
import PerformanceBar from './components/PerformanceBar';

const STORAGE_KEY = 'local-llm-chats';
const MEMORY_KEY = 'local-llm-memory';

function App() {
  const [chats, setChats] = useState([]);
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
  const [sharedMemory, setSharedMemory] = useState([]); // Shared context across chats
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const initializedRef = useRef(false);

  const API_URL = 'http://localhost:1234/v1/chat/completions';

  // Load chats and memory from localStorage on mount
  useEffect(() => {
    if (initializedRef.current) return; // Only run once
    
    try {
      const savedChats = localStorage.getItem(STORAGE_KEY);
      const savedMemory = localStorage.getItem(MEMORY_KEY);
      
      if (savedChats) {
        const parsedChats = JSON.parse(savedChats);
        if (parsedChats.length > 0) {
          setChats(parsedChats);
          setCurrentChatId(parsedChats[0].id);
          initializedRef.current = true;
        } else {
          // Empty array saved, create new chat
          const newChat = {
            id: Date.now(),
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString(),
          };
          setChats([newChat]);
          setCurrentChatId(newChat.id);
          initializedRef.current = true;
        }
      } else {
        // No saved chats, create new one
        const newChat = {
          id: Date.now(),
          title: 'New Chat',
          messages: [],
          createdAt: new Date().toISOString(),
        };
        setChats([newChat]);
        setCurrentChatId(newChat.id);
        initializedRef.current = true;
      }
      
      if (savedMemory) {
        setSharedMemory(JSON.parse(savedMemory));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      // Fallback: create new chat on error
      const newChat = {
        id: Date.now(),
        title: 'New Chat',
        messages: [],
        createdAt: new Date().toISOString(),
      };
      setChats([newChat]);
      setCurrentChatId(newChat.id);
      initializedRef.current = true;
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (initializedRef.current) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
      } catch (error) {
        console.error('Error saving chats to localStorage:', error);
      }
    }
  }, [chats]);

  // Save memory to localStorage whenever it changes
  useEffect(() => {
    if (sharedMemory.length > 0) {
      try {
        localStorage.setItem(MEMORY_KEY, JSON.stringify(sharedMemory));
      } catch (error) {
        console.error('Error saving memory to localStorage:', error);
      }
    }
  }, [sharedMemory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats, currentChatId]);

  const createNewChat = useCallback(() => {
    const newChat = {
      id: Date.now(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setChats(prevChats => {
      const updated = [newChat, ...prevChats];
      return updated;
    });
    setCurrentChatId(newChat.id);
  }, []);

  // Dynamic textarea resizing
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 200;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [input]);

  const deleteChat = (chatId) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    if (currentChatId === chatId) {
      setCurrentChatId(updatedChats.length > 0 ? updatedChats[0].id : null);
    }
  };

  const getCurrentChat = () => {
    return chats.find(chat => chat.id === currentChatId);
  };

  const generateChatTitle = async (chatId, userMessage, assistantMessage) => {
    try {
      // Create a prompt asking the model to generate a short title
      const titlePrompt = `Based on this conversation, generate a short, descriptive title (3-6 words maximum). Be concise and specific.

User: ${userMessage}
Assistant: ${assistantMessage}

Title:`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: titlePrompt }
          ],
          temperature: 0.7,
          max_tokens: 20,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Title generation failed: ${response.status}`);
      }

      const data = await response.json();
      const generatedTitle = data.choices[0]?.message?.content?.trim() || '';
      
      // Clean up the title (remove quotes, limit length)
      let cleanTitle = generatedTitle
        .replace(/^["']|["']$/g, '') // Remove surrounding quotes
        .replace(/^title:\s*/i, '') // Remove "Title:" prefix if present
        .trim();
      
      // Limit to 50 characters
      if (cleanTitle.length > 50) {
        cleanTitle = cleanTitle.slice(0, 47).trim() + '...';
      }
      
      // Fallback to first message if title generation failed
      if (!cleanTitle || cleanTitle.length < 3) {
        cleanTitle = userMessage.slice(0, 50).trim() + (userMessage.length > 50 ? '...' : '');
      }

      // Update chat title
      setChats(prevChats => prevChats.map(chat => {
        if (chat.id === chatId && chat.title === 'New Chat') {
          return { ...chat, title: cleanTitle };
        }
        return chat;
      }));
    } catch (error) {
      console.error('Error generating chat title:', error);
      // Fallback to using first message as title
      const fallbackTitle = userMessage.slice(0, 50).trim() + (userMessage.length > 50 ? '...' : '');
      setChats(prevChats => prevChats.map(chat => {
        if (chat.id === chatId && chat.title === 'New Chat') {
          return { ...chat, title: fallbackTitle };
        }
        return chat;
      }));
    }
  };

  // Build messages array with shared memory context
  const buildMessagesWithContext = (chatMessages) => {
    const messages = [];
    
    // Add shared memory context at the beginning (system-like context)
    if (sharedMemory.length > 0) {
      // Combine all memory into a single system message for better context
      const memoryContent = sharedMemory.map(m => m.content).join('. ') + '.';
      messages.push({
        role: 'system',
        content: `Context from previous conversations: ${memoryContent}`,
      });
    }
    
    // Add current chat messages
    messages.push(...chatMessages);
    
    return messages;
  };

  // Extract key information for shared memory from user messages
  const extractMemory = (userMessage, assistantMessage = '') => {
    const combinedText = `${userMessage} ${assistantMessage}`.toLowerCase();
    
    // Patterns to extract personal information
    const patterns = [
      { regex: /my name is ([\w\s]+?)(?:\.|,|\s|$)/i, type: 'name', format: (match) => `The user's name is ${match.trim()}` },
      { regex: /i'm ([\w\s]+?)(?:\.|,|\s|$)/i, type: 'name', format: (match) => `The user's name is ${match.trim()}` },
      { regex: /i am ([\w\s]+?)(?:\.|,|\s|$)/i, type: 'name', format: (match) => `The user's name is ${match.trim()}` },
      { regex: /call me ([\w\s]+?)(?:\.|,|\s|$)/i, type: 'name', format: (match) => `The user's name is ${match.trim()}` },
      { regex: /name is ([\w\s]+?)(?:\.|,|\s|$)/i, type: 'name', format: (match) => `The user's name is ${match.trim()}` },
      { regex: /i'm called ([\w\s]+?)(?:\.|,|\s|$)/i, type: 'name', format: (match) => `The user's name is ${match.trim()}` },
    ];
    
    for (const pattern of patterns) {
      const match = combinedText.match(pattern.regex);
      if (match && match[1]) {
        const extractedInfo = match[1].trim();
        // Skip if too short or too long (likely false positive)
        if (extractedInfo.length < 2 || extractedInfo.length > 30) continue;
        
        const memoryContent = pattern.format(extractedInfo);
        
        // Check if this info is already in memory (case-insensitive)
        const exists = sharedMemory.some(m => {
          const existingLower = m.content.toLowerCase();
          const newLower = memoryContent.toLowerCase();
          return existingLower === newLower || 
                 (existingLower.includes('name is') && newLower.includes('name is') && 
                  existingLower.split('name is')[1]?.trim() === newLower.split('name is')[1]?.trim());
        });
        
        if (!exists) {
          setSharedMemory(prev => {
            // Remove any existing name entries first (only one name)
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
          console.log('Extracted memory:', memoryContent);
        }
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setPerformance({ tokensPerSecond: null, totalTokens: null, responseTime: null, isStreaming: true });

    const currentChat = getCurrentChat();
    if (!currentChat) return;

    // Extract memory from user message BEFORE adding to chat
    extractMemory(userMessage, '');

    const updatedMessages = [...currentChat.messages, { role: 'user', content: userMessage }];
    const isFirstMessage = currentChat.messages.length === 0;
    
    // Update chat with messages (title will be generated after assistant responds)
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === currentChatId) {
        return { ...chat, messages: updatedMessages };
      }
      return chat;
    }));

    // Add empty assistant message for streaming
    const assistantMessageId = Date.now();
    setChats(prevChats => prevChats.map(chat => 
      chat.id === currentChatId 
        ? { ...chat, messages: [...updatedMessages, { role: 'assistant', content: '', id: assistantMessageId }] }
        : chat
    ));

    // Build messages with shared context
    const messagesWithContext = buildMessagesWithContext(updatedMessages);

    const startTime = Date.now();
    let accumulatedContent = '';
    let tokenCount = 0;
    let lastUpdateTime = startTime;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesWithContext,
          temperature: 0.7,
          max_tokens: 2000,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              break;
            }

            try {
              const json = JSON.parse(data);
              const delta = json.choices[0]?.delta;
              
              if (delta?.content) {
                accumulatedContent += delta.content;
                tokenCount++;
                
                const currentContent = accumulatedContent;
                
                setChats(prevChats => prevChats.map(chat => 
                  chat.id === currentChatId 
                    ? { 
                        ...chat, 
                        messages: chat.messages.map(msg => 
                          msg.id === assistantMessageId 
                            ? { ...msg, content: currentContent }
                            : msg
                        )
                      }
                    : chat
                ));

                const currentTime = Date.now();
                const elapsed = (currentTime - startTime) / 1000;
                const tps = tokenCount / elapsed;

                if (currentTime - lastUpdateTime > 500) {
                  setPerformance({
                    tokensPerSecond: tps,
                    totalTokens: tokenCount,
                    responseTime: currentTime - startTime,
                    isStreaming: true,
                  });
                  lastUpdateTime = currentTime;
                }

                scrollToBottom();
              }

              // Check for final usage stats
              if (json.usage) {
                const endTime = Date.now();
                const totalTime = endTime - startTime;
                const finalTokens = json.usage.completion_tokens || tokenCount;
                const finalTps = finalTokens / (totalTime / 1000);

                setPerformance({
                  tokensPerSecond: finalTps,
                  totalTokens: json.usage.total_tokens || finalTokens,
                  responseTime: totalTime,
                  isStreaming: false,
                });
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      }

      // Final update with complete message
      setChats(prevChats => prevChats.map(chat => 
        chat.id === currentChatId 
          ? { 
              ...chat, 
              messages: chat.messages.map(msg => 
                msg.id === assistantMessageId 
                  ? { ...msg, content: accumulatedContent, id: undefined }
                  : msg
              )
            }
          : chat
      ));

      // Extract memory from both user message and assistant response
      const finalUserMessage = updatedMessages[updatedMessages.length - 1]?.content || '';
      extractMemory(finalUserMessage, accumulatedContent);

      // Generate title from model if this is the first message exchange
      if (isFirstMessage) {
        generateChatTitle(currentChatId, userMessage, accumulatedContent);
      }

      // Final performance update
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const finalTps = tokenCount / (totalTime / 1000);
      
      setPerformance({
        tokensPerSecond: finalTps,
        totalTokens: tokenCount,
        responseTime: totalTime,
        isStreaming: false,
      });

    } catch (error) {
      console.error('Error:', error);
      
      setChats(prevChats => prevChats.map(chat => 
        chat.id === currentChatId 
          ? { 
              ...chat, 
              messages: chat.messages.map(msg => 
                msg.id === assistantMessageId 
                  ? { 
                      role: 'assistant', 
                      content: '❌ Error: ' + error.message + '\n\nMake sure LM Studio server is running and a model is loaded.',
                      id: undefined
                    }
                  : msg
              )
            }
          : chat
      ));

      setPerformance({
        tokensPerSecond: null,
        totalTokens: null,
        responseTime: null,
        isStreaming: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const currentChat = getCurrentChat();

  return (
    <div className="app">
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={createNewChat}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {!sidebarCollapsed && <span>New chat</span>}
          </button>
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
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        className="collapse-btn"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d={sidebarCollapsed ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"}></path>
        </svg>
      </button>

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
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

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
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="send-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
