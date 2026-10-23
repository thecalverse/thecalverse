#!/bin/bash
set -e

DEST_DIR="/Users/maddhamsolanki/Desktop/iPhone Duo"
APP_NAME="Calverse"
APP_BUNDLE="${DEST_DIR}/${APP_NAME}.app"
ROOT_DIR="/Users/maddhamsolanki/.gemini/antigravity/scratch/thecalverse"

mkdir -p "${DEST_DIR}"
rm -rf "${APP_BUNDLE}"
mkdir -p "${APP_BUNDLE}" "${APP_BUNDLE}/web"

SDK_PATH=$(xcrun --sdk iphonesimulator --show-sdk-path)

echo "📦 1. Writing Swift source for iPhone Duo (Dual-Screen Mirroring & Spanning)..."
cat << 'SWIFT_EOF' > /tmp/iphoneduo_main.swift
import UIKit
import WebKit

let LATTE_COLOR = UIColor(red: 228/255, green: 210/255, blue: 191/255, alpha: 1.0)
let DARK_COLOR = UIColor(red: 7/255, green: 7/255, blue: 8/255, alpha: 1.0)

var allActiveDuoControllers: [CalverseIPhoneDuoViewController] = []

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    var additionalWindows: [UIWindow] = []

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        NotificationCenter.default.addObserver(self, selector: #selector(screenDidConnect(notification:)), name: UIScreen.didConnectNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(screenDidDisconnect(notification:)), name: UIScreen.didDisconnectNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(sceneDidActivate(notification:)), name: UIScene.didActivateNotification, object: nil)
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            self.setupSecondaryScreens()
        }
        return true
    }

    @objc func sceneDidActivate(notification: Notification) {
        self.setupSecondaryScreens()
    }

    func setupSecondaryScreens() {
        for screen in UIScreen.screens {
            if screen != UIScreen.main {
                if !self.additionalWindows.contains(where: { $0.screen == screen }) {
                    let win = UIWindow(frame: screen.bounds)
                    win.screen = screen
                    win.backgroundColor = LATTE_COLOR
                    let vc = CalverseIPhoneDuoViewController(isSecondaryDisplay: true)
                    win.rootViewController = vc
                    win.isHidden = false
                    self.additionalWindows.append(win)
                }
            }
        }
    }

    @objc func screenDidConnect(notification: Notification) {
        guard let screen = notification.object as? UIScreen else { return }
        if !self.additionalWindows.contains(where: { $0.screen == screen }) {
            let win = UIWindow(frame: screen.bounds)
            win.screen = screen
            win.backgroundColor = LATTE_COLOR
            let vc = CalverseIPhoneDuoViewController(isSecondaryDisplay: true)
            win.rootViewController = vc
            win.isHidden = false
            self.additionalWindows.append(win)
        }
    }

    @objc func screenDidDisconnect(notification: Notification) {
        guard let screen = notification.object as? UIScreen else { return }
        self.additionalWindows.removeAll { $0.screen == screen }
    }

    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?
    var secondaryWindows: [UIWindow] = []

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = (scene as? UIWindowScene) else { return }
        let win = UIWindow(windowScene: windowScene)
        win.backgroundColor = LATTE_COLOR
        let isSecondary = (self.window != nil) || (windowScene.screen != UIScreen.main)
        let rootVC = CalverseIPhoneDuoViewController(isSecondaryDisplay: isSecondary)
        win.rootViewController = rootVC
        if self.window == nil {
            self.window = win
        } else {
            self.secondaryWindows.append(win)
        }
        win.makeKeyAndVisible()
    }
}

class CalverseIPhoneDuoViewController: UIViewController, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
    var webView: WKWebView!
    var isSecondaryDisplay: Bool = false

    init(isSecondaryDisplay: Bool = false) {
        self.isSecondaryDisplay = isSecondaryDisplay
        super.init(nibName: nil, bundle: nil)
        allActiveDuoControllers.append(self)
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
    }

    override var prefersStatusBarHidden: Bool {
        return false
    }

    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .default
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = LATTE_COLOR

        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        config.setValue(true, forKey: "allowUniversalAccessFromFileURLs")
        config.userContentController.add(self, name: "themeChanged")
        config.userContentController.add(self, name: "calverseAction")

        let screenType = isSecondaryDisplay ? "secondary" : "primary"
        let scriptSource = """
        (() => {
            document.documentElement.setAttribute('data-device', 'iphone-duo');
            document.documentElement.setAttribute('data-env', 'ios-simulator');
            document.documentElement.setAttribute('data-duo-screen', '\(screenType)');
            document.documentElement.classList.add('mode-iphone-duo-dmg');
            window.__CALVERSE_NATIVE_IOS__ = true;
            window.__CALVERSE_IPHONE_DUO__ = true;
            window.__CALVERSE_DUO_SCREEN__ = '\(screenType)';
        })();
        """
        let userScript = WKUserScript(source: scriptSource, injectionTime: .atDocumentStart, forMainFrameOnly: true)
        config.userContentController.addUserScript(userScript)

        webView = WKWebView(frame: view.bounds, configuration: config)
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.isOpaque = false
        webView.backgroundColor = LATTE_COLOR
        webView.scrollView.backgroundColor = LATTE_COLOR
        webView.scrollView.bouncesZoom = false
        webView.scrollView.minimumZoomScale = 1.0
        webView.scrollView.maximumZoomScale = 1.0
        webView.scrollView.contentInsetAdjustmentBehavior = .never

        view.addSubview(webView)
        loadWebContent()
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "themeChanged", let theme = message.body as? String {
            let bg = (theme == "black") ? DARK_COLOR : LATTE_COLOR
            for c in allActiveDuoControllers {
                c.view.backgroundColor = bg
                c.webView.backgroundColor = bg
                c.webView.scrollView.backgroundColor = bg
            }
        }
    }

    func loadWebContent() {
        if let resourceURL = Bundle.main.resourceURL {
            let bundleHTML = resourceURL.appendingPathComponent("web/index.html")
            if FileManager.default.fileExists(atPath: bundleHTML.path) {
                webView.loadFileURL(bundleHTML, allowingReadAccessTo: resourceURL.appendingPathComponent("web"))
                return
            }
        }
        webView.loadHTMLString("<h2 style='color:#333;text-align:center;padding:50px;'>Calverse iPhone Duo Assets Missing</h2>", baseURL: nil)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        let screenType = isSecondaryDisplay ? "secondary" : "primary"
        let js = """
        (() => {
            document.documentElement.setAttribute('data-device', 'iphone-duo');
            document.documentElement.setAttribute('data-env', 'ios-simulator');
            document.documentElement.setAttribute('data-duo-screen', '\(screenType)');
            document.documentElement.classList.add('mode-iphone-duo-dmg');
            window.__CALVERSE_NATIVE_IOS__ = true;
            window.__CALVERSE_IPHONE_DUO__ = true;
            window.__CALVERSE_DUO_SCREEN__ = '\(screenType)';
            window.dispatchEvent(new Event('resize'));
            const curTheme = document.documentElement.getAttribute('data-t') || 'light';
            try { window.webkit.messageHandlers.themeChanged.postMessage(curTheme); } catch(_) {}
        })();
        """
        webView.evaluateJavaScript(js, completionHandler: nil)
    }
}
SWIFT_EOF

echo "⚙️ 2. Compiling Swift for iOS Simulator (arm64-apple-ios17.0-simulator)..."
xcrun --sdk iphonesimulator swiftc \
    -parse-as-library \
    -O \
    -target arm64-apple-ios17.0-simulator \
    -sdk "${SDK_PATH}" \
    /tmp/iphoneduo_main.swift \
    -o "${APP_BUNDLE}/${APP_NAME}"

echo "📝 3. Writing iPhone Duo Info.plist with Multi-Display Manifest..."
cat > "${APP_BUNDLE}/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleExecutable</key>
    <string>${APP_NAME}</string>
    <key>CFBundleIdentifier</key>
    <string>com.thecalverse.iphoneduo</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>${APP_NAME}</string>
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
    <key>UIApplicationSceneManifest</key>
    <dict>
        <key>UIApplicationSupportsMultipleScenes</key>
        <true/>
        <key>UISceneConfigurations</key>
        <dict>
            <key>UIWindowSceneSessionRoleApplication</key>
            <array>
                <dict>
                    <key>UISceneConfigurationName</key>
                    <string>Default Configuration</string>
                    <key>UISceneDelegateClassName</key>
                    <string>SceneDelegate</string>
                </dict>
            </array>
            <key>UIWindowSceneSessionRoleExternalDisplayNonInteractive</key>
            <array>
                <dict>
                    <key>UISceneConfigurationName</key>
                    <string>External Display Configuration</string>
                    <key>UISceneDelegateClassName</key>
                    <string>SceneDelegate</string>
                </dict>
            </array>
        </dict>
    </dict>
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
        <key>NSAllowsLocalNetworking</key>
        <true/>
    </dict>
</dict>
</plist>
EOF

echo "📂 4. Packaging web assets..."
cp "${ROOT_DIR}/app.html" "${APP_BUNDLE}/web/index.html"
if [ -d "${ROOT_DIR}/assets" ]; then
    cp -R "${ROOT_DIR}/assets" "${APP_BUNDLE}/web/"
fi

echo "🔐 5. Code signing..."
codesign --force --deep --sign - "${APP_BUNDLE}"

echo "=== ✅ Done! iPhone Duo Simulator App created at: ${APP_BUNDLE} ==="
