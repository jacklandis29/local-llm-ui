import { API_ENDPOINTS, DEFAULT_MODEL_PARAMS, TITLE_MAX_LENGTH } from '../constants';

/**
 * Generate a chat title based on the first exchange
 */
export async function generateChatTitle(userMessage, assistantMessage) {
  try {
    const titlePrompt = `Based on this conversation, generate a short, descriptive title (3-6 words maximum). Be concise and specific.

User: ${userMessage}
Assistant: ${assistantMessage}

Title:`;

    const response = await fetch(API_ENDPOINTS.CHAT_COMPLETIONS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: titlePrompt }],
        temperature: 0.7,
        max_tokens: 20,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Title generation failed: ${response.status}`);
    }

    const data = await response.json();
    let generatedTitle = data.choices[0]?.message?.content?.trim() || '';

    // Clean up the title
    generatedTitle = generatedTitle
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/^title:\s*/i, '') // Remove "Title:" prefix
      .trim();

    // Limit length
    if (generatedTitle.length > TITLE_MAX_LENGTH) {
      generatedTitle = generatedTitle.slice(0, TITLE_MAX_LENGTH - 3).trim() + '...';
    }

    // Fallback to first message if generation failed
    if (!generatedTitle || generatedTitle.length < 3) {
      generatedTitle = userMessage.slice(0, TITLE_MAX_LENGTH).trim() +
        (userMessage.length > TITLE_MAX_LENGTH ? '...' : '');
    }

    return generatedTitle;
  } catch (error) {
    console.error('Error generating chat title:', error);
    // Fallback to using first message as title
    return userMessage.slice(0, TITLE_MAX_LENGTH).trim() +
      (userMessage.length > TITLE_MAX_LENGTH ? '...' : '');
  }
}

/**
 * Stream chat completion from the API
 */
export async function streamChatCompletion(messages, onChunk, onComplete, onError) {
  const startTime = Date.now();
  let accumulatedContent = '';
  let tokenCount = 0;

  try {
    const response = await fetch(API_ENDPOINTS.CHAT_COMPLETIONS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        temperature: DEFAULT_MODEL_PARAMS.temperature,
        max_tokens: DEFAULT_MODEL_PARAMS.maxTokens,
        stream: DEFAULT_MODEL_PARAMS.stream,
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

              const elapsed = (Date.now() - startTime) / 1000;
              const tokensPerSecond = tokenCount / elapsed;

              onChunk({
                content: accumulatedContent,
                tokenCount,
                tokensPerSecond,
                responseTime: Date.now() - startTime,
              });
            }

            // Check for final usage stats
            if (json.usage) {
              const totalTime = Date.now() - startTime;
              const finalTokens = json.usage.completion_tokens || tokenCount;
              const finalTps = finalTokens / (totalTime / 1000);

              onComplete({
                content: accumulatedContent,
                tokensPerSecond: finalTps,
                totalTokens: json.usage.total_tokens || finalTokens,
                responseTime: totalTime,
              });
              return;
            }
          } catch (e) {
            // Ignore JSON parse errors for incomplete chunks
          }
        }
      }
    }

    // Final completion if no usage stats were provided
    const totalTime = Date.now() - startTime;
    const finalTps = tokenCount / (totalTime / 1000);

    onComplete({
      content: accumulatedContent,
      tokensPerSecond: finalTps,
      totalTokens: tokenCount,
      responseTime: totalTime,
    });
  } catch (error) {
    onError(error);
  }
}

/**
 * Export chat to different formats
 */
export function exportChat(chat, format = 'json') {
  switch (format) {
    case 'json':
      return JSON.stringify(chat, null, 2);

    case 'markdown':
      let markdown = `# ${chat.title}\n\n`;
      markdown += `Created: ${new Date(chat.createdAt).toLocaleString()}\n\n---\n\n`;
      chat.messages.forEach(msg => {
        if (msg.role === 'user') {
          markdown += `**You:** ${msg.content}\n\n`;
        } else {
          markdown += `**Assistant:** ${msg.content}\n\n`;
        }
      });
      return markdown;

    case 'text':
      let text = `${chat.title}\n`;
      text += `Created: ${new Date(chat.createdAt).toLocaleString()}\n\n`;
      chat.messages.forEach(msg => {
        text += `${msg.role.toUpperCase()}: ${msg.content}\n\n`;
      });
      return text;

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Import chat from JSON
 */
export function importChat(jsonString) {
  try {
    const chat = JSON.parse(jsonString);

    // Validate chat structure
    if (!chat.id || !chat.title || !Array.isArray(chat.messages)) {
      throw new Error('Invalid chat format');
    }

    return chat;
  } catch (error) {
    throw new Error(`Failed to import chat: ${error.message}`);
  }
}

/**
 * Download content as file
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
