#!/usr/bin/env python3
"""
fix_bottom_nav.py
Fixes the oversized, stretched bottom nav bar in the Android app so it looks
clean, compact, floating, and pill-shaped, exactly identical to the website.
"""

import os
import re

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX_PATH = os.path.join(ROOT_DIR, "index.html")
APP_PATH = os.path.join(ROOT_DIR, "app.html")
BUILD_APK_SCRIPT = os.path.join(ROOT_DIR, "scripts", "build_android_apk.py")

with open(INDEX_PATH, "r", encoding="utf-8") as f:
    html = f.read()

# 1. Update lines 4440-4472 in index.html (max-width:520px .bnav)
old_bnav_520 = """  .bnav{
    --bn-gap:4px;
    --bn-pad:6px;
    --bn-count:7;
    bottom:38px;
    width:min(86vw,430px);
    max-width:500px;
    min-height:54px;
    justify-content:space-between;
    align-items:center;
    padding:5px 6px;
    border-radius:28px;
    box-shadow:0 9px 16px rgba(0,0,0,.1),0 4px 8px rgba(0,0,0,.04),inset 0 1px 0 var(--glh)!important;
  }
  .bnav-ind{
    top:5px;
    height:44px;
    border-radius:22px;
  }
  .bni{
    flex:1 1 0;
    min-width:0;
    min-height:46px;
    height:46px;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:0;
    border-radius:22px;
  }"""

new_bnav_520 = """  .bnav{
    --bn-gap:4px;
    --bn-pad:4px;
    --bn-count:7;
    bottom:10px!important;
    width:min(400px,calc(100% - 24px))!important;
    max-width:400px!important;
    height:50px!important;
    min-height:50px!important;
    max-height:50px!important;
    justify-content:space-between;
    align-items:center;
    padding:4px 5px!important;
    border-radius:25px!important;
    box-sizing:border-box!important;
    box-shadow:0 16px 36px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.12)!important;
  }
  .bnav-ind{
    top:4px!important;
    height:42px!important;
    border-radius:21px!important;
  }
  .bni{
    flex:1 1 0;
    min-width:0;
    min-height:42px!important;
    height:42px!important;
    max-height:42px!important;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:0;
    border-radius:21px;
  }"""

if old_bnav_520 in html:
    html = html.replace(old_bnav_520, new_bnav_520, 1)
    print("✓ Replaced 520px .bnav with compact pill")
else:
    print("⚠ old_bnav_520 not found exactly")

# 2. Update lines 4489 in index.html (max-width:380px .bnav)
old_bnav_380 = """.bnav{width:min(88vw,410px);min-height:48px;border-radius:28px;bottom:34px;padding:4px 6px;}
  .bnav-ind{top:4px;height:40px;border-radius:20px;}
  .bni{min-height:40px;height:40px;padding:0;display:flex;align-items:center;justify-content:center;}"""

new_bnav_380 = """.bnav{width:min(400px,calc(100% - 20px))!important;height:50px!important;min-height:50px!important;max-height:50px!important;border-radius:25px!important;bottom:10px!important;padding:4px 5px!important;box-sizing:border-box!important;}
  .bnav-ind{top:4px!important;height:42px!important;border-radius:21px!important;}
  .bni{min-height:42px!important;height:42px!important;max-height:42px!important;padding:0;display:flex;align-items:center;justify-content:center;}"""

if old_bnav_380 in html:
    html = html.replace(old_bnav_380, new_bnav_380, 1)
    print("✓ Replaced 380px .bnav with compact pill")
else:
    print("⚠ old_bnav_380 not found exactly")

# 3. Update android-app specific .bnav rules (lines 4569-4620)
old_android_bnav = """  html[data-platform=android-app] .bnav{
    --bn-gap:4px;
    --bn-pad:6px;
    --bn-count:7;
    bottom:38px;
    width:min(86vw,430px);
    max-width:500px;
    min-height:54px;
    padding:5px 6px;
    border-radius:28px;
    box-shadow:0 9px 16px rgba(0,0,0,.1),0 4px 8px rgba(0,0,0,.04),inset 0 1px 0 var(--glh)!important;
  }
  html[data-platform=android-app] .bnav-ind{
    top:5px;
    height:44px;
    border-radius:22px;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 4px 10px rgba(0,0,0,.08)!important;
  }
  html[data-platform=android-app] .bni{
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    min-height:44px;
    gap:2px;
    padding:4px 6px;
    font-size:10px;
    font-weight:800;
    line-height:1;
    letter-spacing:.1px;
    text-align:center;
    border-radius:24px;
  }"""

new_android_bnav = """  html[data-platform=android-app] .bnav{
    --bn-gap:4px;
    --bn-pad:4px;
    --bn-count:7;
    bottom:10px!important;
    width:min(400px,calc(100% - 24px))!important;
    max-width:400px!important;
    height:50px!important;
    min-height:50px!important;
    max-height:50px!important;
    padding:4px 5px!important;
    border-radius:25px!important;
    box-sizing:border-box!important;
    box-shadow:0 16px 36px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.12)!important;
    backdrop-filter:blur(24px) saturate(200%)!important;
    -webkit-backdrop-filter:blur(24px) saturate(200%)!important;
  }
  html[data-platform=android-app] .bnav-ind{
    top:4px!important;
    height:42px!important;
    border-radius:21px!important;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 4px 10px rgba(0,0,0,.08)!important;
  }
  html[data-platform=android-app] .bni{
    flex:1 1 0!important;
    min-width:0!important;
    height:42px!important;
    min-height:42px!important;
    max-height:42px!important;
    padding:0!important;
    display:flex!important;
    justify-content:center!important;
    align-items:center!important;
    border-radius:21px!important;
  }"""

if old_android_bnav in html:
    html = html.replace(old_android_bnav, new_android_bnav, 1)
    print("✓ Replaced android-app .bnav with clean website pill")
else:
    print("⚠ old_android_bnav not found exactly")

# 4. Update android-app small screen (lines 4661-4678)
old_android_small_bnav = """  html[data-platform=android-app] .bnav{
    width:min(88vw,410px);
    min-height:52px;
    border-radius:28px;
    bottom:34px;
    padding:5px 6px;
  }
  html[data-platform=android-app] .bnav-ind{
    top:5px;
    height:42px;
    border-radius:21px;
  }
  html[data-platform=android-app] .bni{
    min-height:42px;
    padding:4px 5px;
    font-size:10px;
    gap:2px;
  }"""

new_android_small_bnav = """  html[data-platform=android-app] .bnav{
    width:min(400px,calc(100% - 20px))!important;
    height:50px!important;
    min-height:50px!important;
    max-height:50px!important;
    border-radius:25px!important;
    bottom:10px!important;
    padding:4px 5px!important;
    box-sizing:border-box!important;
  }
  html[data-platform=android-app] .bnav-ind{
    top:4px!important;
    height:42px!important;
    border-radius:21px!important;
  }
  html[data-platform=android-app] .bni{
    flex:1 1 0!important;
    min-width:0!important;
    height:42px!important;
    min-height:42px!important;
    max-height:42px!important;
    padding:0!important;
    display:flex!important;
    justify-content:center!important;
    align-items:center!important;
    border-radius:21px!important;
  }"""

if old_android_small_bnav in html:
    html = html.replace(old_android_small_bnav, new_android_small_bnav, 1)
    print("✓ Replaced android-app small screen .bnav with clean pill")
else:
    print("⚠ old_android_small_bnav not found exactly")

# 5. Fix android-app #app excessive bottom padding
html = html.replace(
    "calc(128px + var(--safe-bottom))",
    "calc(76px + var(--safe-bottom))"
)
html = html.replace(
    "calc(118px + var(--safe-bottom))",
    "calc(76px + var(--safe-bottom))"
)
print("✓ Adjusted #app bottom padding from 128px/118px to 76px")

with open(INDEX_PATH, "w", encoding="utf-8") as f:
    f.write(html)
with open(APP_PATH, "w", encoding="utf-8") as f:
    f.write(html)
print("✓ Updated index.html and app.html (byte-identical)")

# 6. Update scripts/build_android_apk.py
with open(BUILD_APK_SCRIPT, "r", encoding="utf-8") as f:
    apk_script = f.read()

old_apk_bnav = """  /* Bottom nav bar fits all phone screen sizes neatly without overflow */
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
  }"""

new_apk_bnav = """  /* Floating compact bottom nav matching website exactly */
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
  }"""

if old_apk_bnav in apk_script:
    apk_script = apk_script.replace(old_apk_bnav, new_apk_bnav, 1)
    with open(BUILD_APK_SCRIPT, "w", encoding="utf-8") as f:
        f.write(apk_script)
    print("✓ Updated scripts/build_android_apk.py with website-matching bnav")
else:
    print("⚠ old_apk_bnav not found exactly in build_android_apk.py")
