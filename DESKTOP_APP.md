# Building the Desktop App

This guide explains how to run and build the native desktop application using Electron.

## Prerequisites

- Node.js 16+ installed
- npm or yarn
- Windows, macOS, or Linux

## Development Mode

Run the app in development mode with hot-reload:

```bash
# Install all dependencies (including Electron)
npm install

# Run in development mode
npm run electron:dev
```

This will:
1. Start the React development server on port 3000
2. Wait for it to be ready
3. Launch the Electron app
4. Enable hot-reload for both React and Electron changes

## Building for Production

### Windows

```bash
# Build Windows installer (.exe) and portable version
npm run electron:build:win
```

Output files will be in `dist/`:
- `Local LLM UI Setup x.x.x.exe` - Installer
- `Local LLM UI x.x.x.exe` - Portable version

### macOS

```bash
# Build macOS disk image (.dmg) and zip
npm run electron:build:mac
```

Output files will be in `dist/`:
- `Local LLM UI-x.x.x.dmg` - Disk image
- `Local LLM UI-x.x.x-mac.zip` - Zip archive

### Linux

```bash
# Build Linux AppImage and .deb package
npm run electron:build:linux
```

Output files will be in `dist/`:
- `Local LLM UI-x.x.x.AppImage` - AppImage (works on most distros)
- `local-llm-ui_x.x.x_amd64.deb` - Debian package

### Build All Platforms

```bash
# Build for all platforms (requires specific OS for some targets)
npm run electron:build
```

**Note**: Some platforms can only be built on their native OS (e.g., .dmg only on macOS).

## Application Icons

**Current status**: The app uses default Electron icons. To add custom icons later:

1. Create your icon files (see `assets/README.md` for detailed instructions):
   - `assets/icon.ico` - Windows icon (256x256)
   - `assets/icon.icns` - macOS icon (1024x1024)
   - `assets/icon.png` - Linux icon (512x512)

2. Add icon paths back to `package.json` in the `build` section:
   ```json
   "win": { "icon": "assets/icon.ico" }
   "mac": { "icon": "assets/icon.icns" }
   "linux": { "icon": "assets/icon.png" }
   ```

3. Rebuild the app

**Recommended tools**:
- [iConvert Icons](https://iconverticons.com/online/) - Upload PNG, download all formats
- [CloudConvert](https://cloudconvert.com/) - Convert between formats

## Features in Desktop App

### Menu Bar

- **File Menu**
  - New Chat (Ctrl/Cmd+N)
  - Export Chat (Ctrl/Cmd+E)
  - Quit

- **Edit Menu**
  - Standard edit operations (Cut, Copy, Paste, etc.)

- **View Menu**
  - Toggle Sidebar (Ctrl/Cmd+B)
  - Toggle Theme (Ctrl/Cmd+D)
  - Zoom controls
  - Toggle Fullscreen

- **Window Menu**
  - Minimize, Zoom, Bring All to Front

- **Help Menu**
  - Learn More
  - About

### Window Features

- **Title Bar**: Native titlebar with custom overlay
- **Minimum Size**: 1000x600 pixels
- **Default Size**: 1400x900 pixels
- **Background**: Matches app theme (#212121)

### Keyboard Shortcuts

All shortcuts from the web version work, plus:
- `Ctrl/Cmd+E` - Export current chat
- `Ctrl/Cmd+Q` - Quit application (macOS)
- `Alt+F4` - Quit application (Windows/Linux)

## Configuration

### Changing App Details

Edit `package.json`:

```json
{
  "name": "local-llm-ui",
  "version": "1.0.0",
  "description": "Your custom description",
  "author": "Your Name",
  "build": {
    "appId": "com.your-app.id",
    "productName": "Your App Name"
  }
}
```

### Build Configuration

The `build` section in `package.json` controls electron-builder settings:

- **appId**: Unique identifier for your app
- **productName**: Display name of the application
- **files**: Which files to include in the build
- **win/mac/linux**: Platform-specific settings

### Advanced Configuration

See [electron-builder documentation](https://www.electron.build/) for advanced options like:
- Code signing
- Auto-updates
- Custom installers
- File associations

## Troubleshooting

### Electron won't install

If you get errors installing Electron:

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build fails

1. Make sure you've run `npm run build` first
2. Check that `build/` directory exists and contains files
3. Verify all dependencies are installed
4. Check console for specific error messages

### App won't start

1. Check that LM Studio is running
2. Verify the API URL in settings
3. Look at developer console (Ctrl/Cmd+Shift+I in dev mode)
4. Check the main process logs

### White screen on startup

This usually means the build wasn't created properly:

```bash
# Rebuild the React app
npm run build

# Then try electron again
npm run electron
```

## Distribution

### Windows

- The `.exe` installer is signed by default (if you have a code signing certificate)
- Portable version doesn't require installation
- Both work on Windows 10+ (64-bit)

### macOS

- `.dmg` file can be distributed
- Users may need to allow the app in Security & Privacy settings
- Code signing recommended for distribution

### Linux

- `.AppImage` works on most distros without installation
- `.deb` for Debian/Ubuntu-based systems
- Consider `.rpm` for Red Hat-based systems (add to build config)

## Updates

To add auto-updates:

1. Install electron-updater
2. Configure update server
3. Add update checking code
4. Set up release infrastructure

See the [electron-updater docs](https://www.electron.build/auto-update) for details.

## Performance

### Optimizing Build Size

- Remove unused dependencies
- Use production builds only
- Enable compression in electron-builder config
- Consider using `asar` archives (enabled by default)

### Memory Usage

- The Electron app uses more RAM than a browser tab
- Typical usage: 200-400 MB
- Memory increases with conversation history
- Clear old chats to reduce memory usage

## Development Tips

### Hot Reload

In development mode, both React and Electron code reload automatically:
- React changes: Instant hot reload
- Electron main process: Requires app restart (handled automatically)
- CSS changes: Instant update

### Debugging

**Main Process** (Electron):
```javascript
console.log('Debug from main process');
// Check terminal output
```

**Renderer Process** (React):
```javascript
console.log('Debug from React');
// Check DevTools console
```

Open DevTools: `Ctrl/Cmd+Shift+I`

### Testing

```bash
# Run React tests
npm test

# Manual testing
npm run electron:dev
```

## Next Steps

- Customize the app icon
- Add your branding
- Set up code signing for production
- Configure auto-updates
- Add custom menu items
- Implement IPC for advanced features

Enjoy your native desktop LLM app! 🚀
