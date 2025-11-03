# Quick Start Guide

Get your personal AI desktop app up and running in 5 minutes!

## Prerequisites

Before you begin, make sure you have:

1. **Node.js 16 or higher** installed
   - Check: `node --version`
   - Download: https://nodejs.org/

2. **LM Studio** installed and running
   - Download: https://lmstudio.ai/
   - Load a model (Qwen 7B or 13B recommended)
   - Start the server on port 1234

## Installation

### Step 1: Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install all required packages including:
- React and UI components
- Electron (for the desktop app)
- PDF and DOCX processors
- And other dependencies

**Note**: Electron download may take a few minutes as it's ~100MB.

### Step 2: Start LM Studio

1. Open LM Studio
2. Go to "Local Server" tab
3. Load your model (if not already loaded)
4. Click "Start Server"
5. Verify it shows "Running on http://localhost:1234"

### Step 3: Launch Your AI

You have two options:

#### Option A: Desktop App (Recommended) ⭐

```bash
npm run electron:dev
```

This launches a native desktop application with:
- Professional menu bar
- Native window controls
- System integration
- Better performance

#### Option B: Web Browser

```bash
npm start
```

This opens the app in your default browser at `http://localhost:3000`

## First Time Setup

Once the app is running:

1. **Test the connection**: Type a message and press Enter
   - If you get a response, you're all set!
   - If not, check the Troubleshooting section below

2. **Upload your knowledge**: Press `Ctrl+U` to open the Knowledge Base
   - Upload PDFs, documents, code files
   - Build your AI's memory with files about your projects, life, preferences

3. **Customize settings**: Click the ⚙️ icon to:
   - Change the API URL if needed
   - Adjust model parameters (temperature, max tokens)
   - Configure other preferences

## Building Your Personal "Jarvis"

The Knowledge Base feature lets you create a truly personalized AI:

1. **Upload personal documents**:
   - Your resume/CV
   - Project documentation
   - Meeting notes
   - Code repositories
   - Personal preferences and context

2. **The AI remembers everything**:
   - Files persist across sessions
   - Knowledge survives model updates
   - No need to re-upload when switching models

3. **Grow smarter over time**:
   - Add more documents as you work
   - The AI learns about your projects and preferences
   - Context accumulates to create your personal assistant

## Building Desktop Installers

Ready to create an installer you can share or install on other machines?

### Windows

```bash
npm run build
npm run electron:build:win
```

Creates installer in `dist/Local LLM UI Setup x.x.x.exe`

### macOS

```bash
npm run build
npm run electron:build:mac
```

Creates disk image in `dist/Local LLM UI-x.x.x.dmg`

### Linux

```bash
npm run build
npm run electron:build:linux
```

Creates AppImage in `dist/Local LLM UI-x.x.x.AppImage`

See [DESKTOP_APP.md](DESKTOP_APP.md) for detailed build instructions.

## Keyboard Shortcuts

Essential shortcuts to know:

- **Ctrl+N**: New chat
- **Ctrl+D**: Toggle dark/light theme
- **Ctrl+B**: Toggle sidebar
- **Ctrl+U**: Open knowledge base
- **Ctrl+L**: Focus input field
- **Ctrl+E**: Export chat (desktop app)
- **Enter**: Send message
- **Shift+Enter**: New line

## Troubleshooting

### Electron installation fails

If `npm install` fails to download Electron (403 error):

```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

If still failing, you may be behind a corporate firewall. Try:
- Using a VPN
- Setting npm proxy: `npm config set proxy http://proxy.company.com:8080`
- Installing from a different network

### "Connection refused" or "Network error"

1. **Check LM Studio is running**:
   - Look for green "Server Running" indicator
   - Verify port 1234 is shown

2. **Check CORS settings**:
   - Open LM Studio Settings
   - Enable "CORS" or "Allow all origins"
   - Restart the server

3. **Check firewall**:
   - Make sure localhost connections are allowed
   - Temporarily disable firewall to test

### "Model not loaded" or slow responses

1. **Load a model** in LM Studio (if not already loaded)
2. **Check GPU usage** in LM Studio - should show activity
3. **Try a smaller model** if responses are too slow
4. **Reduce max tokens** in settings (try 1000 instead of 2000)

### File uploads not working

1. **Check file size**: Maximum 50MB per file
2. **Check file format**: PDF, DOCX, TXT, code files supported
3. **Check browser console** (F12) for error messages

### Desktop app won't start

1. **Make sure React build exists**:
   ```bash
   npm run build
   ```

2. **Try development mode first**:
   ```bash
   npm run electron:dev
   ```

3. **Check for errors** in the terminal output

## Next Steps

- **Customize icons**: See [assets/README.md](assets/README.md)
- **Add features**: Check [FEATURE_ROADMAP.md](FEATURE_ROADMAP.md)
- **Read full docs**: See [README.md](README.md)
- **Build guide**: See [DESKTOP_APP.md](DESKTOP_APP.md)

## Getting Help

If you encounter issues:

1. Check the console output (terminal and browser F12)
2. Verify LM Studio is working (test in their UI first)
3. Try restarting both the app and LM Studio
4. Clear browser localStorage and try again

## Tips for Best Results

1. **Start with good models**:
   - Qwen 7B: Fast, good quality
   - Qwen 13B: Better quality, slower
   - Llama 3: Excellent all-around

2. **Build your knowledge base gradually**:
   - Start with key documents
   - Add more as you discover what helps
   - Keep files under 10-20MB each for best performance

3. **Manage your conversations**:
   - Create new chats for different topics
   - Export important conversations
   - Clear old chats to save space

4. **Optimize for your hardware**:
   - RTX 5080: Can handle 13B+ models easily
   - Adjust temperature (0.7 = balanced, 0.3 = focused, 1.0 = creative)
   - Adjust max tokens based on your needs

Enjoy your personal AI assistant! 🚀
