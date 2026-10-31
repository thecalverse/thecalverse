#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$DIR/.." && pwd)"

echo "=== 🚀 Building Calverse Studio (macOS Native App & DMG) ==="

APP_NAME="Calverse"
APP_BUNDLE="$DIR/$APP_NAME.app"
CONTENTS="$APP_BUNDLE/Contents"
MACOS_DIR="$CONTENTS/MacOS"
RESOURCES_DIR="$CONTENTS/Resources"
WEB_DIR="$RESOURCES_DIR/web"
STAGING_DIR="/tmp/calverse_dmg_stage"
OUTPUT_DMG="$DIR/$APP_NAME.dmg"
DESKTOP_DMG="$HOME/Desktop/$APP_NAME.dmg"

# 1. Clean previous builds
rm -rf "$APP_BUNDLE" "$STAGING_DIR" "$OUTPUT_DMG"
mkdir -p "$MACOS_DIR" "$RESOURCES_DIR" "$WEB_DIR" "$STAGING_DIR"

# 2. Compile Swift Native App
echo "📦 Compiling Swift native wrapper..."
swiftc -O "$DIR/main.swift" -o "$MACOS_DIR/$APP_NAME"

# 3. Bundle Metadata & Icon
echo "🎨 Packaging Info.plist and AppIcon.icns..."
cp "$DIR/Info.plist" "$CONTENTS/Info.plist"
if [ -f "$DIR/AppIcon.icns" ]; then
    cp "$DIR/AppIcon.icns" "$RESOURCES_DIR/AppIcon.icns"
fi

# 4. Bundle Web Assets
echo "📂 Bundling local web assets (isolated from production)..."
cp "$ROOT_DIR/app.html" "$WEB_DIR/index.html"
if [ -d "$ROOT_DIR/assets" ]; then
    cp -R "$ROOT_DIR/assets" "$WEB_DIR/"
fi

# Code sign locally for ad-hoc execution (prevents Gatekeeper errors on local Mac)
echo "🔐 Ad-hoc code signing $APP_NAME.app..."
codesign --force --deep --sign - "$APP_BUNDLE"

# 5. Prepare DMG Staging
echo "💿 Staging DMG volume..."
cp -R "$APP_BUNDLE" "$STAGING_DIR/"
ln -s /Applications "$STAGING_DIR/Applications"

# 6. Create Compressed DMG
echo "🗜️ Creating Apple Disk Image ($OUTPUT_DMG)..."
hdiutil create \
    -volname "Calverse Studio" \
    -srcfolder "$STAGING_DIR" \
    -ov \
    -format UDZO \
    "$OUTPUT_DMG"

# Also copy to user Desktop for instant 1-click access
cp "$OUTPUT_DMG" "$DESKTOP_DMG"

echo "=== ✅ BUILD COMPLETE ==="
echo "📁 DMG saved to:"
echo "   1) $DESKTOP_DMG"
echo "   2) $OUTPUT_DMG"
echo "📦 App Bundle at: $APP_BUNDLE"
