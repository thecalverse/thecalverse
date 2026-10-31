#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$DIR/.." && pwd)"
DIST_DIR="$DIR/dist"
DESKTOP_DIR="$HOME/Desktop"

mkdir -p "$DIST_DIR"

build_device() {
    local DEVICE_KEY="$1"      # MACBOOK, IPHONE, IPAD, IPHONE_DUO
    local APP_NAME="$2"        # "Calverse MacBook", etc.
    local DMG_NAME="$3"        # "Calverse-MacBook", etc.
    local BUNDLE_ID="$4"       # "com.calverse.macbook", etc.
    local SWIFT_FLAG="$5"      # DEVICE_MACBOOK, DEVICE_IPHONE, etc.

    echo ""
    echo "=========================================================="
    echo "🔨 Building $APP_NAME ($DMG_NAME.dmg)..."
    echo "=========================================================="

    local APP_BUNDLE="$DIST_DIR/$APP_NAME.app"
    local CONTENTS="$APP_BUNDLE/Contents"
    local MACOS_DIR="$CONTENTS/MacOS"
    local RESOURCES_DIR="$CONTENTS/Resources"
    local WEB_DIR="$RESOURCES_DIR/web"
    local STAGING_DIR="/tmp/calverse_dmg_${DEVICE_KEY}"
    local OUTPUT_DMG="$DIST_DIR/$DMG_NAME.dmg"
    local FINAL_DESKTOP_DMG="$DESKTOP_DIR/$DMG_NAME.dmg"

    # Clean previous
    rm -rf "$APP_BUNDLE" "$STAGING_DIR" "$OUTPUT_DMG" "$FINAL_DESKTOP_DMG"
    mkdir -p "$MACOS_DIR" "$RESOURCES_DIR" "$WEB_DIR" "$STAGING_DIR"

    # Compile Swift binary with target device flag
    echo "  ⚙️ Compiling Swift with -$SWIFT_FLAG..."
    swiftc -O -D "$SWIFT_FLAG" "$DIR/main.swift" -o "$MACOS_DIR/$APP_NAME"

    # Generate custom Info.plist
    cat > "$CONTENTS/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleExecutable</key>
    <string>$APP_NAME</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundleIdentifier</key>
    <string>$BUNDLE_ID</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$APP_NAME</string>
    <key>CFBundleDisplayName</key>
    <string>$APP_NAME</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>13.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSRequiresAquaSystemAppearance</key>
    <false/>
</dict>
</plist>
EOF

    # Copy Icon
    if [ -f "$DIR/AppIcon.icns" ]; then
        cp "$DIR/AppIcon.icns" "$RESOURCES_DIR/AppIcon.icns"
    fi

    # Bundle Web Assets
    echo "  📂 Bundling web assets..."
    cp "$ROOT_DIR/app.html" "$WEB_DIR/index.html"
    if [ -d "$ROOT_DIR/assets" ]; then
        cp -R "$ROOT_DIR/assets" "$WEB_DIR/"
    fi

    # Code-sign app ad-hoc
    echo "  🔐 Ad-hoc code signing..."
    codesign --force --deep --sign - "$APP_BUNDLE"

    # Stage DMG
    echo "  💿 Preparing DMG staging folder..."
    cp -R "$APP_BUNDLE" "$STAGING_DIR/"
    ln -s /Applications "$STAGING_DIR/Applications"

    # Create DMG
    echo "  🗜️ Creating DMG image: $DMG_NAME.dmg..."
    hdiutil create \
        -volname "$APP_NAME" \
        -srcfolder "$STAGING_DIR" \
        -ov \
        -format UDZO \
        "$OUTPUT_DMG" > /dev/null

    # Copy to Desktop
    cp "$OUTPUT_DMG" "$FINAL_DESKTOP_DMG"
    rm -rf "$STAGING_DIR"

    echo "  ✅ Done: $FINAL_DESKTOP_DMG"
}

# 1. Calverse MacBook
build_device "MACBOOK" "Calverse MacBook" "Calverse-MacBook" "com.calverse.macbook" "DEVICE_MACBOOK"

# 2. Calverse iPhone
build_device "IPHONE" "Calverse iPhone" "Calverse-iPhone" "com.calverse.iphone" "DEVICE_IPHONE"

# 3. Calverse iPad
build_device "IPAD" "Calverse iPad" "Calverse-iPad" "com.calverse.ipad" "DEVICE_IPAD"

# 4. Calverse iPhone Duo
build_device "IPHONE_DUO" "Calverse iPhone Duo" "Calverse-iPhoneDuo" "com.calverse.iphoneduo" "DEVICE_IPHONE_DUO"

echo ""
echo "🎉 ALL 4 DMGs SUCCESSFULLY CREATED AND PLACED ON YOUR DESKTOP!"
echo "📁 Check: $DESKTOP_DIR"
ls -lh "$DESKTOP_DIR"/Calverse-*.dmg
