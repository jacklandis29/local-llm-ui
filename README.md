# Local LLM UI

A modern, ChatGPT-style interface for your local LLM running on LM Studio. Built with React and designed for desktop use with plans to become a native application.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/react-18.2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### ✅ Current Features

- **Real-time Streaming**: Live token streaming from LM Studio API with performance metrics
- **Markdown Rendering**: Full markdown support with syntax-highlighted code blocks
- **Code Block Copy**: One-click copy-to-clipboard for code snippets
- **Multiple Chat Sessions**: Manage multiple conversations with persistent storage
- **Light/Dark Theme**: Toggle between light and dark modes (Ctrl+D)
- **Keyboard Shortcuts**: Efficient navigation and control
- **Message Regeneration**: Regenerate AI responses with one click
- **Conversation Export**: Export chats as JSON, Markdown, or plain text
- **Performance Monitoring**: Real-time tokens/second, token count, and response time
- **Shared Memory**: Context retention across chat sessions
- **Auto-generated Titles**: Intelligent chat naming based on content
- **Error Boundaries**: Graceful error handling with recovery options
- **Knowledge Base**: Upload files (PDF, DOCX, TXT, code, etc.) to build your AI's long-term memory
- **File Processing**: Automatic text extraction from PDFs, Word documents, and various file types
- **Persistent Knowledge**: Files stored locally and available across all conversations

### Keyboard Shortcuts

- **Ctrl+N**: Create new chat
- **Ctrl+D**: Toggle light/dark theme
- **Ctrl+B**: Toggle sidebar
- **Ctrl+L**: Focus input field
- **Ctrl+U**: Open knowledge base
- **Enter**: Send message
- **Shift+Enter**: New line in input

## Setup Instructions

### Prerequisites

- Node.js 16+ installed
- LM Studio running with a model loaded

### Installation

1. **Clone or extract this project**
   ```bash
   cd local-llm-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API URL (Optional)**

   Copy `.env.example` to `.env` and modify if needed:
   ```bash
   cp .env.example .env
   ```

   Default: `http://localhost:1234`

4. **Start LM Studio**
   - Open LM Studio
   - Load your preferred model
   - Go to "Local Server" tab
   - Click "Start Server"
   - Verify it's running on port 1234 (or your configured port)

5. **Start the application**
   ```bash
   npm start
   ```

   The browser will open automatically at `http://localhost:3000`

## Project Structure

```
local-llm-ui/
├── src/
│   ├── components/          # React components
│   │   ├── CodeBlock.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── FileLibrary.jsx
│   │   ├── FileUpload.jsx
│   │   ├── KnowledgeBaseModal.jsx
│   │   ├── MarkdownRenderer.jsx
│   │   └── PerformanceBar.jsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useKeyboardShortcuts.js
│   │   ├── useKnowledgeBase.js
│   │   ├── useLocalStorage.js
│   │   ├── useMemory.js
│   │   └── useTheme.js
│   ├── utils/               # Utility functions
│   │   ├── chatUtils.js
│   │   └── fileProcessors.js
│   ├── constants/           # Application constants
│   │   └── index.js
│   ├── App.jsx             # Main application component
│   ├── App.css             # Application styles
│   ├── index.js            # Entry point
│   └── index.css           # Global styles
├── public/                  # Static assets
├── package.json            # Dependencies and scripts
├── .env.example            # Environment variables template
├── FEATURE_ROADMAP.md      # Planned features
└── README.md               # This file
```

## Architecture Highlights

### Clean Code Principles

- **Custom Hooks**: Logic extracted into reusable hooks (useTheme, useMemory, useLocalStorage, useKeyboardShortcuts)
- **Utility Functions**: Chat operations centralized in `chatUtils.js`
- **Constants Management**: Magic strings and numbers in dedicated constants file
- **Error Boundaries**: Graceful error handling with user-friendly recovery
- **CSS Variables**: Theme system using CSS custom properties
- **Component Modularity**: Small, focused, reusable components

### State Management

- **Local Storage Sync**: Automatic persistence of chats, memory, and preferences
- **Shared Memory**: Context retention across chat sessions
- **Performance Tracking**: Real-time streaming metrics

## API Configuration

The application connects to LM Studio's OpenAI-compatible API:

- **Endpoint**: `/v1/chat/completions`
- **Features Used**: Streaming, temperature control, token limits
- **Default Model Params**:
  - Temperature: 0.7
  - Max Tokens: 2000
  - Stream: true

## Knowledge Base - Building Your Personal AI

The Knowledge Base feature allows you to upload files that become part of your AI's long-term memory, helping create a truly personalized AI assistant.

### How It Works

1. **Upload Files**: Press `Ctrl+U` or click the folder icon in the sidebar
2. **Automatic Processing**: Files are automatically processed and text is extracted
3. **Persistent Storage**: All files are stored locally in your browser
4. **Contextual Availability**: File content is automatically included in conversations as context

### Supported File Types

- **Documents**: PDF, DOCX, TXT, Markdown
- **Code**: JavaScript, TypeScript, Python, Java, C/C++, Go, Rust, Ruby, PHP, and more
- **Data**: JSON, XML, YAML, TOML, CSV
- **Web**: HTML, CSS

### Use Cases

- **Project Documentation**: Upload project docs, README files, technical specifications
- **Personal Notes**: Your journal entries, meeting notes, research notes
- **Code Repositories**: Upload code files for the AI to understand your codebase
- **Learning Materials**: Study notes, course materials, research papers
- **Life Context**: Personal information, preferences, goals, routines

### File Management

- **Search**: Quickly find files by name or content
- **Preview**: View file contents before using them
- **Remove**: Delete files you no longer need
- **Statistics**: Track total files and storage used

### Building Your "Jarvis"

This feature is designed to help you create a personal AI assistant that:
- Knows about your projects and codebase
- Understands your personal context and preferences
- Retains information across model updates
- Grows smarter as you add more context

The knowledge base persists in browser localStorage, so your AI's memory survives even when you upgrade to better models.

## Troubleshooting

### CORS Errors

1. Open LM Studio Settings (gear icon)
2. Find "Server" settings
3. Enable "CORS" or "Allow all origins"
4. Restart the LM Studio server

### Connection Refused

1. Verify LM Studio server is running (green indicator)
2. Check that a model is loaded
3. Confirm port 1234 is not in use by another application
4. Check `.env` file for correct API URL

### Application Errors

1. Check browser console (F12) for detailed error messages
2. Clear browser cache and localStorage
3. Restart both the UI and LM Studio
4. Check that all dependencies are installed: `npm install`

## Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

### Adding Features

Refer to `FEATURE_ROADMAP.md` for planned features and priorities.

## Future Plans

### High Priority
- Native desktop application (Electron/Tauri)
- Conversation search
- Message editing with branching
- Model switching interface
- Import/export improvements

### Medium Priority
- Web search integration
- File upload and processing
- Advanced memory system
- Plugin architecture

### Low Priority
- Multi-modal capabilities (images, audio)
- Code interpreter
- Agent workflows

See `FEATURE_ROADMAP.md` for complete details.

## Performance Notes

### Optimization Tips

- **Virtual Scrolling**: Will be added for long conversations
- **Memory Management**: Clear old chats periodically
- **Model Selection**: Smaller models = faster responses
- **Token Limits**: Adjust max tokens based on needs

### Hardware Recommendations

- Works great on RTX 4000+ series
- Decent performance on RTX 3000 series
- RTX 2000 series usable with smaller models

## Contributing

This is a personal project, but suggestions are welcome! Please see `FEATURE_ROADMAP.md` for areas where contributions would be most valuable.

## Tech Stack

- **Frontend**: React 18
- **Markdown**: react-markdown with remark-gfm
- **Code Highlighting**: react-syntax-highlighter
- **Styling**: Pure CSS with CSS custom properties
- **API**: LM Studio (OpenAI-compatible)

## License

MIT License - feel free to use and modify as needed.

## Acknowledgments

- LM Studio for the excellent local LLM server
- OpenAI for the API specification
- The React community for excellent tools and libraries
