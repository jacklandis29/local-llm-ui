# Application Icons

This directory contains the application icons for the desktop app.

## Required Icons

For a fully branded desktop app, you'll need the following icon files:

### Windows
- `icon.ico` - 256x256 pixels
  - Windows installer and app icon
  - Multi-resolution .ico file

### macOS
- `icon.icns` - 1024x1024 pixels
  - macOS app bundle icon
  - Contains multiple resolutions

### Linux
- `icon.png` - 512x512 pixels
  - Used for AppImage and .deb packages
  - PNG format with transparency

## Creating Icons

### Option 1: Online Tools
Use these free online converters to create icons from a PNG image:

- **iConvert Icons**: https://iconverticons.com/online/
  - Upload a 1024x1024 PNG
  - Download .ico, .icns, and .png versions

- **CloudConvert**: https://cloudconvert.com/
  - Converts between .png, .ico, and .icns formats

### Option 2: Command Line Tools

#### For .ico (Windows):
```bash
# Using ImageMagick
convert icon-1024.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

#### For .icns (macOS):
```bash
# On macOS only
mkdir icon.iconset
sips -z 16 16 icon-1024.png --out icon.iconset/icon_16x16.png
sips -z 32 32 icon-1024.png --out icon.iconset/icon_16x16@2x.png
# ... repeat for all sizes
iconutil -c icns icon.iconset
```

#### For .png (Linux):
```bash
# Simple resize
convert icon-source.png -resize 512x512 icon.png
```

## Using Default Icons

If you don't have custom icons yet, the app will build with default Electron icons. To enable custom icons later:

1. Create your icon files following the specifications above
2. Place them in this `assets/` directory
3. Uncomment the icon lines in `package.json` under the `build` section
4. Rebuild the app

## Design Recommendations

- Start with a 1024x1024 PNG image
- Use simple, recognizable designs (works better at small sizes)
- Include transparency for rounded corners
- Test icons at multiple sizes (16x16, 32x32, 64x64, etc.)
- Avoid fine details that won't be visible when small
- Use high contrast colors for better visibility

## Current Status

⚠️ **Icons not yet created** - The app will use default Electron icons until custom icons are added.
