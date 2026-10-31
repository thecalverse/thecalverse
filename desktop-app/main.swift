import Cocoa
import WebKit

#if DEVICE_IPHONE
let APP_TITLE = "Calverse iPhone"
let DEFAULT_DEVICE = "iphone"
let DEFAULT_WIDTH: CGFloat = 430
let DEFAULT_HEIGHT: CGFloat = 932
let SUPPORTS_ROTATION = true
#elseif DEVICE_IPAD
let APP_TITLE = "Calverse iPad"
let DEFAULT_DEVICE = "ipad"
let DEFAULT_WIDTH: CGFloat = 1024
let DEFAULT_HEIGHT: CGFloat = 1366
let SUPPORTS_ROTATION = true
#elseif DEVICE_IPHONE_DUO
let APP_TITLE = "Calverse iPhone Duo"
let DEFAULT_DEVICE = "iphone-duo"
let DEFAULT_WIDTH: CGFloat = 1380
let DEFAULT_HEIGHT: CGFloat = 880
let SUPPORTS_ROTATION = true
#else
// MacBook Edition
let APP_TITLE = "Calverse MacBook"
let DEFAULT_DEVICE = "macbook"
let DEFAULT_WIDTH: CGFloat = 1280
let DEFAULT_HEIGHT: CGFloat = 840
let SUPPORTS_ROTATION = false
#endif

class AppDelegate: NSObject, NSApplicationDelegate, WKNavigationDelegate, WKUIDelegate {
    var window: NSWindow!
    var webView: WKWebView!
    var isLandscape: Bool = false

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)

        let screenRect = NSScreen.main?.visibleFrame ?? NSRect(x: 100, y: 100, width: 1400, height: 900)
        let initialWidth = min(DEFAULT_WIDTH, screenRect.width - 40)
        let initialHeight = min(DEFAULT_HEIGHT, screenRect.height - 40)
        let initialX = screenRect.origin.x + (screenRect.width - initialWidth) / 2
        let initialY = screenRect.origin.y + (screenRect.height - initialHeight) / 2

        window = NSWindow(
            contentRect: NSRect(x: initialX, y: initialY, width: initialWidth, height: initialHeight),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.title = "Calverse"
        window.minSize = NSSize(width: 360, height: 480)
        window.isReleasedWhenClosed = false

        // WKWebView Configuration
        let config = WKWebViewConfiguration()
        config.preferences.setValue(true, forKey: "developerExtrasEnabled")
        config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        config.setValue(true, forKey: "allowUniversalAccessFromFileURLs")

        let duoExtra = (DEFAULT_DEVICE == "iphone-duo") ? "document.documentElement.classList.add('mode-iphone-duo-dmg'); window.__CALVERSE_DMG_DUO__ = true;" : ""

        let scriptSource = """
        (() => {
            document.documentElement.setAttribute('data-device', '\(DEFAULT_DEVICE)');
            document.documentElement.setAttribute('data-env', 'dmg');
            window.__CALVERSE_DMG__ = true;
            \(duoExtra)
        })();
        """
        let userScript = WKUserScript(source: scriptSource, injectionTime: .atDocumentStart, forMainFrameOnly: true)
        config.userContentController.addUserScript(userScript)

        webView = WKWebView(frame: window.contentView!.bounds, configuration: config)
        webView.autoresizingMask = [.width, .height]
        webView.navigationDelegate = self
        webView.uiDelegate = self

        window.contentView?.addSubview(webView)

        setupMenus()
        loadLocalWeb()

        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    @objc func rotateOrientation() {
        guard SUPPORTS_ROTATION else { return }
        isLandscape.toggle()
        let screenRect = NSScreen.main?.visibleFrame ?? NSRect(x: 100, y: 100, width: 1400, height: 900)

        var targetW = isLandscape ? DEFAULT_HEIGHT : DEFAULT_WIDTH
        var targetH = isLandscape ? DEFAULT_WIDTH : DEFAULT_HEIGHT

        #if DEVICE_IPHONE_DUO
        targetW = isLandscape ? 880 : 1380
        targetH = isLandscape ? 1380 : 880
        #endif

        let clampedW = min(targetW, screenRect.width - 40)
        let clampedH = min(targetH, screenRect.height - 40)
        let newX = screenRect.origin.x + (screenRect.width - clampedW) / 2
        let newY = screenRect.origin.y + (screenRect.height - clampedH) / 2

        window.setFrame(NSRect(x: newX, y: newY, width: clampedW, height: clampedH), display: true, animate: true)

        let duoExtra = (DEFAULT_DEVICE == "iphone-duo") ? "document.documentElement.classList.add('mode-iphone-duo-dmg'); window.__CALVERSE_DMG_DUO__ = true;" : ""
        let js = """
        (() => {
            document.documentElement.setAttribute('data-device', '\(DEFAULT_DEVICE)');
            document.documentElement.setAttribute('data-orientation', '\(isLandscape ? "landscape" : "portrait")');
            document.documentElement.setAttribute('data-env', 'dmg');
            \(duoExtra)
            window.dispatchEvent(new Event('resize'));
        })();
        """
        webView.evaluateJavaScript(js, completionHandler: nil)
    }

    @objc func reloadPage() {
        webView.reload()
    }

    func loadLocalWeb() {
        let bundle = Bundle.main
        var webURL: URL? = nil
        var baseDir: URL? = nil

        if let resURL = bundle.resourceURL {
            let bundleWeb = resURL.appendingPathComponent("web/index.html")
            if FileManager.default.fileExists(atPath: bundleWeb.path) {
                webURL = bundleWeb
                baseDir = resURL.appendingPathComponent("web")
            }
        }

        if webURL == nil {
            let scratchPath = "/Users/maddhamsolanki/.gemini/antigravity/scratch/thecalverse/index.html"
            if FileManager.default.fileExists(atPath: scratchPath) {
                webURL = URL(fileURLWithPath: scratchPath)
                baseDir = URL(fileURLWithPath: "/Users/maddhamsolanki/.gemini/antigravity/scratch/thecalverse")
            }
        }

        if let targetURL = webURL, let dir = baseDir {
            webView.loadFileURL(targetURL, allowingReadAccessTo: dir)
        } else {
            webView.loadHTMLString("<h2>Could not find Calverse assets</h2>", baseURL: nil)
        }
    }

    func setupMenus() {
        let mainMenu = NSMenu()

        // App Menu
        let appMenuItem = NSMenuItem()
        let appMenu = NSMenu()
        appMenu.addItem(withTitle: "About Calverse", action: #selector(NSApplication.orderFrontStandardAboutPanel(_:)), keyEquivalent: "")
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Quit Calverse", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        appMenuItem.submenu = appMenu
        mainMenu.addItem(appMenuItem)

        // View Menu
        let viewMenuItem = NSMenuItem()
        let viewMenu = NSMenu(title: "View")
        viewMenu.addItem(withTitle: "Reload Page", action: #selector(reloadPage), keyEquivalent: "r")
        if SUPPORTS_ROTATION {
            viewMenu.addItem(NSMenuItem.separator())
            viewMenu.addItem(withTitle: "Rotate Orientation", action: #selector(rotateOrientation), keyEquivalent: "o")
        }
        viewMenuItem.submenu = viewMenu
        mainMenu.addItem(viewMenuItem)

        NSApp.mainMenu = mainMenu
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        let duoExtra = (DEFAULT_DEVICE == "iphone-duo") ? "document.documentElement.classList.add('mode-iphone-duo-dmg'); window.__CALVERSE_DMG_DUO__ = true;" : ""
        let js = """
        (() => {
            document.documentElement.setAttribute('data-device', '\(DEFAULT_DEVICE)');
            document.documentElement.setAttribute('data-orientation', '\(isLandscape ? "landscape" : "portrait")');
            document.documentElement.setAttribute('data-env', 'dmg');
            window.__CALVERSE_DMG__ = true;
            \(duoExtra)
            window.dispatchEvent(new Event('resize'));
        })();
        """
        webView.evaluateJavaScript(js, completionHandler: nil)
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
