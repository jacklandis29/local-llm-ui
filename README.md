# Local LLM UI - Dark Mode

Modern ChatGPT-style interface for your local LLM running on LM Studio.

## Setup Instructions

### 1. Extract this folder to your desired location
Example: `C:\local-ai-chat`

### 2. Open PowerShell in this folder
- Right-click the folder in File Explorer
- Select "Open in Terminal" or "Open PowerShell window here"

### 3. Install dependencies
```powershell
npm install
```

### 4. Make sure LM Studio is running
- Open LM Studio
- Load your Qwen model
- Go to "Local Server" tab
- Click "Start Server"
- Confirm it's running on port 1234

### 5. Start the UI
```powershell
npm start
```

The browser will open automatically at http://localhost:3000

## Features
- ✅ Modern dark mode design
- ✅ ChatGPT-style interface
- ✅ Multiple chat sessions
- ✅ Collapsible sidebar
- ✅ Clean message layout
- ✅ Smooth animations

## Troubleshooting

### If you get CORS errors:
1. In LM Studio, go to Settings (gear icon)
2. Find "Server" settings
3. Enable "CORS" or "Allow all origins"
4. Restart the LM Studio server

### If nothing loads:
1. Make sure LM Studio server is running (green indicator)
2. Make sure a model is loaded
3. Check the console (F12) for error messages
4. Try restarting both the UI and LM Studio

## Tech Stack
- React 18
- LM Studio API (OpenAI-compatible)
- Pure CSS (no external UI libraries)
