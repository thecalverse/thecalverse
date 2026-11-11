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
import struct
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
OUTPUT_TABLET_APK = os.path.join(ANDROID_APP_DIR, "Calverse-Tablet-and-Phone.apk")
OUTPUT_AAB = os.path.join(ANDROID_APP_DIR, "Calverse.aab")
DESKTOP_APK = os.path.expanduser("~/Desktop/Calverse.apk")
DESKTOP_TABLET_APK = os.path.expanduser("~/Desktop/Calverse-Tablet-and-Phone.apk")
DESKTOP_AAB = os.path.expanduser("~/Desktop/Calverse.aab")

PACKAGE_NAME = "com.thecalverse"

def patch_binary_manifest(manifest_path, new_pkg):
    with open(manifest_path, "rb") as f:
        data = f.read()

    file_type, file_hdr_size, file_size = struct.unpack_from("<HHI", data, 0)
    if file_type != 0x0003:
        return data

    sp_offset = file_hdr_size
    sp_type, sp_hdr_size, sp_size = struct.unpack_from("<HHI", data, sp_offset)
    if sp_type != 0x0001:
        return data

    string_count, style_count, flags, strings_start, styles_start = struct.unpack_from("<IIIII", data, sp_offset + 8)

    offsets_start = sp_offset + 28
    string_offsets = list(struct.unpack_from(f"<{string_count}I", data, offsets_start))

    strings_data_start = sp_offset + strings_start
    strings_data_len = (styles_start - strings_start) if style_count > 0 else (sp_size - strings_start)
    pool_bytes = data[strings_data_start:strings_data_start + strings_data_len]

    strings = []
    for off in string_offsets:
        u16len = struct.unpack_from("<H", pool_bytes, off)[0]
        s = pool_bytes[off + 2: off + 2 + u16len * 2].decode("utf-16le")
        strings.append(s)

    new_strings = []
    for s in strings:
        if s == "com.calverse.app.v17":
            new_strings.append(new_pkg)
        elif s == "com.calverse.app.v17.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION":
            new_strings.append(f"{new_pkg}.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION")
        elif s == "com.calverse.app.v17.androidx-startup":
            new_strings.append(f"{new_pkg}.androidx-startup")
        elif s in ("1.7-v17", "1.0.0", "1.1"):
            new_strings.append("1.1")
        else:
            new_strings.append(s)

    new_pool_bytes = bytearray()
    new_offsets = []
    for s in new_strings:
        new_offsets.append(len(new_pool_bytes))
        new_pool_bytes += struct.pack("<H", len(s)) + s.encode("utf-16le") + b"\x00\x00"

    while len(new_pool_bytes) % 4 != 0:
        new_pool_bytes += b"\x00"

    new_sp_size = 28 + len(new_offsets) * 4 + (style_count * 4) + len(new_pool_bytes)
    while new_sp_size % 4 != 0:
        new_sp_size += 1
        new_pool_bytes += b"\x00"

    delta = new_sp_size - sp_size
    new_file_size = file_size + delta

    new_data = bytearray()
    new_data += struct.pack("<HHI", file_type, file_hdr_size, new_file_size)
    new_data += struct.pack("<HHI", sp_type, sp_hdr_size, new_sp_size)
    new_data += struct.pack("<IIIII", string_count, style_count, flags, 28 + len(new_offsets) * 4 + (style_count * 4), 0 if style_count == 0 else (styles_start + delta))
    new_data += struct.pack(f"<{string_count}I", *new_offsets)
    new_data += new_pool_bytes
    new_data += data[sp_offset + sp_size:]

    # 2. Disable android:debuggable (set to false for Google Play release)
    debuggable_idx = None
    version_code_idx = None
    for idx, s in enumerate(new_strings):
        if s == "debuggable":
            debuggable_idx = idx
        elif s == "versionCode":
            version_code_idx = idx

    if debuggable_idx is not None or version_code_idx is not None:
        for i in range(sp_offset + new_sp_size, len(new_data) - 20, 4):
            ns, name, rawVal, type_info, attr_data = struct.unpack_from("<IIIII", new_data, i)
            if debuggable_idx is not None and name == debuggable_idx:
                dt = (type_info >> 24) & 0xff
                if dt == 0x12: # TYPE_INT_BOOLEAN
                    struct.pack_into("<I", new_data, i + 16, 0)
                    print("✓ Disabled android:debuggable (set to false for Google Play release)")
            elif version_code_idx is not None and name == version_code_idx:
                dt = (type_info >> 24) & 0xff
                if dt == 0x10 and attr_data in (17, 18):
                    struct.pack_into("<I", new_data, i + 16, 19)
                    print("✓ Updated versionCode to 19 (Version Name: 1.1)")

    with open(manifest_path, "wb") as f:
        f.write(new_data)
    print(f"✓ Patched AndroidManifest.xml package to {new_pkg}")

BUILD_TOOLS_DIR = "/Users/maddhamsolanki/Library/Android/sdk/build-tools/35.0.0"
KEYSTORE = os.path.join(ANDROID_APP_DIR, "calverse-release.keystore")
KEY_ALIAS = "calverse"
KEY_PASS = "calverse2026"

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
  /* Disable heavy backdrop-filter blur on inner cards on Android to prevent Chromium tile memory overflow, but KEEP translucent blur on topbar and bnav */
  html[data-platform="android-app"] *:not(.topbar):not(.bnav):not(.topbar *):not(.bnav *),
  html[data-platform="android-app"] *:not(.topbar):not(.bnav):not(.topbar *):not(.bnav *)::before,
  html[data-platform="android-app"] *:not(.topbar):not(.bnav):not(.topbar *):not(.bnav *)::after {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
  html[data-platform="android-app"] .topbar,
  html[data-platform="android-app"] .bnav {
    backdrop-filter: blur(24px) saturate(200%) !important;
    -webkit-backdrop-filter: blur(24px) saturate(200%) !important;
  }
  html[data-platform="android-app"] .topbar {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    margin: 0 !important;
    z-index: 1000 !important;
    padding-top: max(48px, calc(env(safe-area-inset-top, 0px) + 12px)) !important;
    padding-bottom: 10px !important;
    padding-left: calc(16px + env(safe-area-inset-left, 0px)) !important;
    padding-right: calc(16px + env(safe-area-inset-right, 0px)) !important;
    box-sizing: border-box !important;
    border-radius: 0 !important;
  }
  html[data-platform="android-app"] #app {
    padding-top: calc(max(48px, calc(env(safe-area-inset-top, 0px) + 12px)) + 48px) !important;
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
  /* Ensure splash screen fades cleanly after animation completes */
  #sp.hide {
    opacity: 0 !important;
    pointer-events: none !important;
    display: none !important;
  }
  /* Floating compact bottom nav matching website exactly */
  .bnav,
  html[data-platform="android-app"] .bnav {
    position: fixed !important;
    bottom: 10px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    width: min(400px, calc(100% - 24px)) !important;
    max-width: 400px !important;
    height: 50px !important;
    min-height: 50px !important;
    max-height: 50px !important;
    padding: 4px 5px !important;
    border-radius: 25px !important;
    box-sizing: border-box !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    gap: 4px !important;
  }
  .bnav-ind,
  html[data-platform="android-app"] .bnav-ind {
    top: 4px !important;
    height: 42px !important;
    border-radius: 21px !important;
  }
  .bni,
  html[data-platform="android-app"] .bni {
    flex: 1 1 0 !important;
    min-width: 0 !important;
    height: 42px !important;
    min-height: 42px !important;
    max-height: 42px !important;
    padding: 0 !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    border-radius: 21px !important;
  }
  .bni span,
  html[data-platform="android-app"] .bni span {
    display: none !important;
  }
  .bnico,
  html[data-platform="android-app"] .bnico {
    font-size: 20px !important;
    width: 24px !important;
    height: 24px !important;
    display: grid !important;
    place-items: center !important;
    margin: 0 auto !important;
  }
  html[data-platform="android-app"] #app {
    padding-bottom: 76px !important;
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

        # Patch AndroidManifest.xml package name to com.thecalverse
        manifest_file = os.path.join(extracted_dir, "AndroidManifest.xml")
        if os.path.exists(manifest_file):
            patch_binary_manifest(manifest_file, PACKAGE_NAME)

        # Write new V17.html into assets/
        assets_dir = os.path.join(extracted_dir, "assets")
        os.makedirs(assets_dir, exist_ok=True)
        v17_target = os.path.join(assets_dir, "V17.html")
        with open(v17_target, "w", encoding="utf-8") as f:
            f.write(v17_content)

        # Copy all bundled web assets into APK assets/assets/ and assets/
        print("Copying offline web assets (logos, stickers, backgrounds) into APK...")
        src_assets = os.path.join(PROJECT_ROOT, "assets")
        nested_assets = os.path.join(assets_dir, "assets")
        os.makedirs(nested_assets, exist_ok=True)

        # 1. Logos & metadata
        logo_files = [
            "calverse-logo.png",
            "calverse-logo-latte.png",
            "calverse-wave-symbol.png",
            "Calverse-Logo-In-The-Box.svg",
            "Calverse-Logo-Round.png",
            "Calverse-Logo-Round.svg",
            "templates_manifest.json"
        ]
        for lf in logo_files:
            src_file = os.path.join(src_assets, lf)
            if os.path.exists(src_file):
                shutil.copy2(src_file, os.path.join(nested_assets, lf))
                shutil.copy2(src_file, os.path.join(assets_dir, lf))
        print("✓ Bundled logos and manifest into APK")

        # 2. Stickers
        src_stickers = os.path.join(src_assets, "stickers")
        if os.path.exists(src_stickers):
            dst_nested_stickers = os.path.join(nested_assets, "stickers")
            if os.path.exists(dst_nested_stickers):
                shutil.rmtree(dst_nested_stickers)
            shutil.copytree(src_stickers, dst_nested_stickers)
            print(f"✓ Bundled {len(os.listdir(src_stickers))} stickers into APK")

        # 3. Backgrounds (full + thumbs)
        src_bg = os.path.join(src_assets, "backgrounds")
        if os.path.exists(src_bg):
            dst_nested_bg = os.path.join(nested_assets, "backgrounds")
            if os.path.exists(dst_nested_bg):
                shutil.rmtree(dst_nested_bg)
            shutil.copytree(src_bg, dst_nested_bg)
            print("✓ Bundled backgrounds into APK")

        # Update Android launcher icons from extracted_icons
        icons_source = os.path.join(ANDROID_APP_DIR, "extracted_icons")
        if os.path.exists(icons_source):
            for density in os.listdir(icons_source):
                src_density = os.path.join(icons_source, density)
                if os.path.isdir(src_density):
                    dst_density = os.path.join(extracted_dir, "res", density)
                    if os.path.exists(dst_density):
                        for icon_file in os.listdir(src_density):
                            shutil.copy2(os.path.join(src_density, icon_file), os.path.join(dst_density, icon_file))
            print("✓ Updated Android launcher icons in APK package")

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

        # Copy APK to destinations
        shutil.copy2(aligned_apk, OUTPUT_APK)
        shutil.copy2(aligned_apk, OUTPUT_DEBUG_APK)
        shutil.copy2(aligned_apk, OUTPUT_TABLET_APK)
        shutil.copy2(aligned_apk, DESKTOP_APK)
        shutil.copy2(aligned_apk, DESKTOP_TABLET_APK)

        apk_size_mb = os.path.getsize(OUTPUT_APK) / (1024 * 1024)
        print(f"SUCCESS! Output APK: {OUTPUT_APK} ({apk_size_mb:.2f} MB)")
        print(f"SUCCESS! Also created: {OUTPUT_DEBUG_APK}")
        print(f"SUCCESS! Tablet & Phone Unified APK: {OUTPUT_TABLET_APK}")
        print(f"SUCCESS! Updated on Desktop: {DESKTOP_APK}")
        print(f"SUCCESS! Updated on Desktop: {DESKTOP_TABLET_APK}")

        # Build Android App Bundle (.aab) for Google Play Console
        print("\n--- Packaging Android App Bundle (.aab) for Google Play Console ---")
        aapt2_bin = os.path.join(BUILD_TOOLS_DIR, "aapt2")
        bundletool_jar = os.path.join(SCRIPT_DIR, "bundletool.jar")

        if os.path.exists(aapt2_bin) and os.path.exists(bundletool_jar):
            # 1. Convert APK to proto format using aapt2 convert
            proto_apk = os.path.join(tmpdir, "proto.apk")
            print("Converting APK resources to protobuf format with aapt2...")
            subprocess.check_call([aapt2_bin, "convert", "--output-format", "proto", "-o", proto_apk, aligned_apk])

            # 2. Extract proto.apk and arrange into bundle module layout
            proto_extracted = os.path.join(tmpdir, "proto_extracted")
            with zipfile.ZipFile(proto_apk, "r") as z:
                z.extractall(proto_extracted)

            module_dir = os.path.join(tmpdir, "base_module")
            os.makedirs(os.path.join(module_dir, "manifest"), exist_ok=True)
            os.makedirs(os.path.join(module_dir, "dex"), exist_ok=True)

            # Move Manifest
            manifest_src = os.path.join(proto_extracted, "AndroidManifest.xml")
            if os.path.exists(manifest_src):
                shutil.move(manifest_src, os.path.join(module_dir, "manifest", "AndroidManifest.xml"))

            # Move Dex files
            for f in os.listdir(proto_extracted):
                if f.startswith("classes") and f.endswith(".dex"):
                    shutil.move(os.path.join(proto_extracted, f), os.path.join(module_dir, "dex", f))

            # Move res, resources.pb, assets, lib
            for item in ["res", "resources.pb", "assets", "lib"]:
                src_p = os.path.join(proto_extracted, item)
                if os.path.exists(src_p):
                    shutil.move(src_p, os.path.join(module_dir, item))

            # 3. Zip base_module into base.zip
            base_zip = os.path.join(tmpdir, "base.zip")
            with zipfile.ZipFile(base_zip, "w", zipfile.ZIP_DEFLATED) as z_out:
                for root, dirs, files in os.walk(module_dir):
                    for file in files:
                        full = os.path.join(root, file)
                        rel = os.path.relpath(full, module_dir)
                        z_out.write(full, rel)

            # 4. Run bundletool build-bundle
            raw_aab = os.path.join(tmpdir, "uncompressed.aab")
            print("Building final .aab with bundletool...")
            subprocess.check_call([
                "java", "-jar", bundletool_jar,
                "build-bundle",
                f"--modules={base_zip}",
                f"--output={raw_aab}",
                "--overwrite"
            ])

            # 5. Sign AAB with jarsigner
            print("Signing Android App Bundle with jarsigner...")
            subprocess.check_call([
                "jarsigner",
                "-keystore", KEYSTORE,
                "-storepass", KEY_PASS,
                "-keypass", KEY_PASS,
                raw_aab,
                KEY_ALIAS
            ])

            # 6. Copy AAB to output locations
            shutil.copy2(raw_aab, OUTPUT_AAB)
            shutil.copy2(raw_aab, DESKTOP_AAB)
            aab_size_mb = os.path.getsize(OUTPUT_AAB) / (1024 * 1024)
            print(f"SUCCESS! Output Android App Bundle: {OUTPUT_AAB} ({aab_size_mb:.2f} MB)")
            print(f"SUCCESS! Updated on Desktop: {DESKTOP_AAB}")
        else:
            print("Warning: aapt2 or bundletool.jar not found, skipped .aab packaging.")

if __name__ == "__main__":
    build_apk()
