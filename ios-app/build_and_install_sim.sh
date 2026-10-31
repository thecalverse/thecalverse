#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$DIR/.." && pwd)"
BUILD_DIR="$DIR/build"
APP_NAME="Calverse"
APP_BUNDLE="$BUILD_DIR/$APP_NAME.app"
BUNDLE_ID="com.thecalverse.duo"

echo "=== 📱 Building Native iOS App for iPhone Duo Simulator ==="

rm -rf "$BUILD_DIR"
mkdir -p "$APP_BUNDLE" "$APP_BUNDLE/web"

SDK_PATH=$(xcrun --sdk iphonesimulator --show-sdk-path)

echo "📦 1. Compiling Swift native iOS binary..."
xcrun --sdk iphonesimulator swiftc \
    -parse-as-library \
    -O \
    -target arm64-apple-ios17.0-simulator \
    -sdk "$SDK_PATH" \
    "$DIR/main.swift" \
    -o "$APP_BUNDLE/$APP_NAME"

echo "📝 2. Writing Info.plist..."
cat > "$APP_BUNDLE/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleExecutable</key>
    <string>$APP_NAME</string>
    <key>CFBundleIdentifier</key>
    <string>$BUNDLE_ID</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$APP_NAME</string>
    <key>CFBundleDisplayName</key>
    <string>Calverse</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>UIDeviceFamily</key>
    <array>
        <integer>1</integer>
        <integer>2</integer>
    </array>
    <key>UIRequiresFullScreen</key>
    <false/>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
        <string>UIInterfaceOrientationPortraitUpsideDown</string>
    </array>
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
    </dict>
    <key>UIViewControllerBasedStatusBarAppearance</key>
    <false/>
</dict>
</plist>
EOF

echo "📂 3. Packaging web assets..."
cp "$ROOT_DIR/app.html" "$APP_BUNDLE/web/index.html"
if [ -d "$ROOT_DIR/assets" ]; then
    cp -R "$ROOT_DIR/assets" "$APP_BUNDLE/web/"
fi

# Ad-hoc sign for simulator execution
codesign --force --deep --sign - "$APP_BUNDLE"

echo "📲 4. Finding iPhone Duo simulator..."
DEVICE_ID=$(xcrun simctl list devices | grep -E "iPhone Duo.*Booted" | head -n 1 | sed -E 's/.*\(([A-F0-9-]+)\).*/\1/')

if [ -z "$DEVICE_ID" ]; then
    DEVICE_ID=$(xcrun simctl list devices | grep -E "iPhone Duo" | head -n 1 | sed -E 's/.*\(([A-F0-9-]+)\).*/\1/')
    if [ -n "$DEVICE_ID" ]; then
        echo "Booting iPhone Duo ($DEVICE_ID)..."
        xcrun simctl boot "$DEVICE_ID" || true
    fi
fi

if [ -z "$DEVICE_ID" ]; then
    echo "⚠️ Using default booted device..."
    DEVICE_ID="booted"
fi

echo "🚀 5. Installing Calverse.app to Simulator ($DEVICE_ID)..."
xcrun simctl install "$DEVICE_ID" "$APP_BUNDLE"

echo "✨ 6. Launching Calverse on iPhone Duo..."
xcrun simctl launch "$DEVICE_ID" "$BUNDLE_ID"

echo "=== ✅ Calverse Native App is NOW RUNNING on your iPhone Duo Simulator! ==="
