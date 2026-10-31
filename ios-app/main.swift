import UIKit
import WebKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        let win = UIWindow(frame: UIScreen.main.bounds)
        win.backgroundColor = .black
        let rootVC = CalverseWebViewController()
        win.rootViewController = rootVC
        self.window = win
        win.makeKeyAndVisible()
        return true
    }
}

class CalverseWebViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {
    var webView: WKWebView!

    override var prefersStatusBarHidden: Bool {
        return false
    }

    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .lightContent
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 14/255, green: 14/255, blue: 16/255, alpha: 1.0)

        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        config.setValue(true, forKey: "allowUniversalAccessFromFileURLs")

        // Inject iPhone Duo environment flags
        let scriptSource = """
        (() => {
            document.documentElement.setAttribute('data-device', 'iphone-duo');
            document.documentElement.setAttribute('data-env', 'ios-app');
            document.documentElement.classList.add('mode-iphone-duo-dmg');
            window.__CALVERSE_NATIVE_IOS__ = true;
            window.__CALVERSE_IPHONE_DUO__ = true;
            console.log('Calverse Native iOS App Loaded on iPhone Duo! 📱📱✨');
        })();
        """
        let userScript = WKUserScript(source: scriptSource, injectionTime: .atDocumentStart, forMainFrameOnly: true)
        config.userContentController.addUserScript(userScript)

        webView = WKWebView(frame: view.bounds, configuration: config)
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.scrollView.backgroundColor = .clear
        webView.scrollView.contentInsetAdjustmentBehavior = .never

        view.addSubview(webView)
        loadWebContent()
    }

    func loadWebContent() {
        let bundle = Bundle.main
        var targetURL: URL? = nil
        var readAccessURL: URL? = nil

        if let resourceURL = bundle.resourceURL {
            let bundleHTML = resourceURL.appendingPathComponent("web/index.html")
            if FileManager.default.fileExists(atPath: bundleHTML.path) {
                targetURL = bundleHTML
                readAccessURL = resourceURL.appendingPathComponent("web")
            }
        }

        // Development fallback to workspace if running in simulator directly
        if targetURL == nil {
            let localPath = "/Users/maddhamsolanki/.gemini/antigravity/scratch/thecalverse/index.html"
            if FileManager.default.fileExists(atPath: localPath) {
                targetURL = URL(fileURLWithPath: localPath)
                readAccessURL = URL(fileURLWithPath: "/Users/maddhamsolanki/.gemini/antigravity/scratch/thecalverse")
            }
        }

        if let htmlURL = targetURL, let accessURL = readAccessURL {
            webView.loadFileURL(htmlURL, allowingReadAccessTo: accessURL)
        } else {
            webView.loadHTMLString("""
            <body style='background:#111;color:#fff;font-family:sans-serif;padding:40px;text-align:center;'>
                <h2>Calverse App Assets Missing</h2>
                <p>Could not locate web/index.html in app bundle.</p>
            </body>
            """, baseURL: nil)
        }
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        let js = """
        (() => {
            document.documentElement.setAttribute('data-device', 'iphone-duo');
            document.documentElement.setAttribute('data-env', 'ios-app');
            document.documentElement.classList.add('mode-iphone-duo-dmg');
            window.__CALVERSE_NATIVE_IOS__ = true;
            window.__CALVERSE_IPHONE_DUO__ = true;
            window.dispatchEvent(new Event('resize'));
        })();
        """
        webView.evaluateJavaScript(js, completionHandler: nil)
    }
}
