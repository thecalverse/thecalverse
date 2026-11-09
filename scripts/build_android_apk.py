#!/usr/bin/env python3
"""
Build and sign Calverse Android APK from the current index.html.
Ensures:
1. No web ad codes/scripts in the APK.
2. Responsive layout for both mobile and tablet.
3. Proper Android bridge support (CalverseBridge).
4. Signed with Android debug keystore and zipalign.
5. Android WebView performance optimizations (no backdrop-filter tile memory exhaustion).
"""

import os
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
INDEX_HTML = os.path.join(PROJECT_ROOT, "index.html")
ANDROID_APP_DIR = os.path.join(PROJECT_ROOT, "android-app")
BASE_APK = os.path.join(ANDROID_APP_DIR, "calverse-base.apk")
OUTPUT_APK = os.path.join(ANDROID_APP_DIR, "Calverse.apk")
OUTPUT_DEBUG_APK = os.path.join(ANDROID_APP_DIR, "calverse-v17-debug.apk")
DESKTOP_APK = os.path.expanduser("~/Desktop/Calverse.apk")

BUILD_TOOLS_DIR = "/Users/maddhamsolanki/Library/Android/sdk/build-tools/35.0.0"
KEYSTORE = os.path.expanduser("~/.android/debug.keystore")
KEY_ALIAS = "androiddebugkey"
KEY_PASS = "android"

def prepare_v17_html(source_path):
    with open(source_path, "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Remove <base href="/">
    html = re.sub(r'<base\s+href=["\'][^"\']*["\']\s*/?>', '', html, flags=re.IGNORECASE)

    # 2. Remove external AdSense script tag
    html = re.sub(r'<script\s+async\s+src=["\']https://pagead2\.googlesyndication\.com/[^"\']*["\'][^>]*></script>', '', html, flags=re.IGNORECASE)

    # 3. Strip or neutralize ad units and add Android WebView optimizations
    ad_cleanup_and_optimizations = """
<style id="android-ad-suppression">
  .dashboard-banner-ad, [class*="-banner-ad"], ins.adsbygoogle {
    display: none !important;
    height: 0 !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }
  /* Disable heavy backdrop-filter blur on Android to prevent Chromium tile memory overflow */
  html[data-platform="android-app"] *,
  html[data-platform="android-app"] *::before,
  html[data-platform="android-app"] *::after {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
  /* Ensure app and scrolling work smoothly on Android */
  html[data-platform="android-app"],
  html[data-platform="android-app"] body {
    height: auto !important;
    min-height: 100% !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }
  html[data-platform="android-app"] #app {
    opacity: 1 !important;
    transform: none !important;
    height: auto !important;
    min-height: 100dvh !important;
    overflow: visible !important;
  }
  html[data-platform="android-app"] .screen {
    overflow: visible !important;
  }
  /* Ensure splash screen fades cleanly */
  #sp.hide, #sp.play-out {
    opacity: 0 !important;
    pointer-events: none !important;
    display: none !important;
  }
  /* Bottom nav bar fits all phone screen sizes neatly without overflow */
  @media (max-width: 520px) {
    .bnav {
      width: calc(100% - 16px) !important;
      max-width: 420px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      padding: 4px 4px calc(4px + env(safe-area-inset-bottom, 0px)) !important;
      gap: 2px !important;
    }
    .bni {
      font-size: 9.5px !important;
      padding: 3px 2px !important;
      min-width: 0 !important;
      flex: 1 1 0 !important;
    }
    .bnico {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }
  }
</style>
<script id="android-ad-mock">
  window.adsbygoogle = {
    push: function() { return 0; },
    loaded: true
  };
</script>
"""
    # Insert right before </head>
    if "</head>" in html:
        html = html.replace("</head>", ad_cleanup_and_optimizations + "\n</head>", 1)
    else:
        html = ad_cleanup_and_optimizations + "\n" + html

    # 4. Ensure html tag has data-platform="android-app"
    if "<html" in html:
        html = re.sub(r'<html([^>]*)>', r'<html\1 data-platform="android-app">', html, count=1)
        html = html.replace('data-platform="android-app" data-platform="android-app"', 'data-platform="android-app"')

    return html

def build_apk():
    print("--- Starting Calverse Android APK Build ---")

    if not os.path.exists(INDEX_HTML):
        sys.exit(f"Error: index.html not found at {INDEX_HTML}")

    if not os.path.exists(BASE_APK):
        sys.exit(f"Error: Base APK template not found at {BASE_APK}")

    zipalign_bin = os.path.join(BUILD_TOOLS_DIR, "zipalign")
    apksigner_bin = os.path.join(BUILD_TOOLS_DIR, "apksigner")

    if not os.path.exists(zipalign_bin) or not os.path.exists(apksigner_bin):
        sys.exit("Error: Android build-tools not found.")

    v17_content = prepare_v17_html(INDEX_HTML)
    print(f"Generated V17.html ({len(v17_content):,} bytes) from index.html (ads stripped, android bridge enabled)")

    with tempfile.TemporaryDirectory() as tmpdir:
        extracted_dir = os.path.join(tmpdir, "extracted")
        os.makedirs(extracted_dir, exist_ok=True)

        print("Extracting base APK...")
        with zipfile.ZipFile(BASE_APK, "r") as zip_ref:
            zip_ref.extractall(extracted_dir)

        # Remove previous signatures
        meta_inf = os.path.join(extracted_dir, "META-INF")
        if os.path.exists(meta_inf):
            for fname in os.listdir(meta_inf):
                if fname.endswith((".SF", ".RSA", ".DSA", ".MF")):
                    os.remove(os.path.join(meta_inf, fname))

        # Write new V17.html into assets/
        assets_dir = os.path.join(extracted_dir, "assets")
        os.makedirs(assets_dir, exist_ok=True)
        v17_target = os.path.join(assets_dir, "V17.html")
        with open(v17_target, "w", encoding="utf-8") as f:
            f.write(v17_content)

        # Repackage intermediate unaligned APK
        unaligned_apk = os.path.join(tmpdir, "unaligned.apk")
        print("Packaging unaligned APK...")
        with zipfile.ZipFile(unaligned_apk, "w", zipfile.ZIP_DEFLATED) as zip_out:
            for root, dirs, files in os.walk(extracted_dir):
                for file in files:
                    full_path = os.path.join(root, file)
                    rel_path = os.path.relpath(full_path, extracted_dir)
                    if rel_path.endswith((".png", ".webp", ".so", "resources.arsc")):
                        zip_out.write(full_path, rel_path, compress_type=zipfile.ZIP_STORED)
                    else:
                        zip_out.write(full_path, rel_path, compress_type=zipfile.ZIP_DEFLATED)

        # Run zipalign
        aligned_apk = os.path.join(tmpdir, "aligned.apk")
        print("Running zipalign...")
        subprocess.check_call([zipalign_bin, "-p", "-f", "4", unaligned_apk, aligned_apk])

        # Run apksigner
        print("Signing APK with debug key...")
        subprocess.check_call([
            apksigner_bin, "sign",
            "--ks", KEYSTORE,
            "--ks-pass", f"pass:{KEY_PASS}",
            "--ks-key-alias", KEY_ALIAS,
            aligned_apk
        ])

        # Verify APK
        print("Verifying signed APK...")
        subprocess.check_call([apksigner_bin, "verify", "--verbose", aligned_apk])

        # Copy to destinations
        shutil.copy2(aligned_apk, OUTPUT_APK)
        shutil.copy2(aligned_apk, OUTPUT_DEBUG_APK)
        shutil.copy2(aligned_apk, DESKTOP_APK)

        size_mb = os.path.getsize(OUTPUT_APK) / (1024 * 1024)
        print(f"SUCCESS! Output APK: {OUTPUT_APK} ({size_mb:.2f} MB)")
        print(f"SUCCESS! Also created: {OUTPUT_DEBUG_APK}")
        print(f"SUCCESS! Updated on Desktop: {DESKTOP_APK}")

if __name__ == "__main__":
    build_apk()
