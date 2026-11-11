#!/usr/bin/env python3
"""
apply_ui_fixes.py
Applies the following fixes to index.html:
1. Pinned fixed frosted-glass .topbar on mobile & APK with content scrolling smoothly behind it.
2. In APK & web, Calverse logo in dark mode, latte mode, and opening splash screen.
   Includes embedded base64 data URIs as foolproof fallback.
3. Fix resolveCalverseAsset so all 114 stickers and 107 backgrounds load locally in APK
   and from /assets/... on web, with robust Cloudflare CDN fallback.
4. Synchronizes index.html to app.html (100% byte-identical).
"""

import os
import re
import base64

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX_PATH = os.path.join(ROOT_DIR, "index.html")
APP_PATH = os.path.join(ROOT_DIR, "app.html")

DARK_LOGO_PATH = os.path.join(ROOT_DIR, "assets", "calverse-logo.png")
LATTE_LOGO_PATH = os.path.join(ROOT_DIR, "assets", "calverse-logo-latte.png")

with open(DARK_LOGO_PATH, "rb") as f:
    DARK_B64 = base64.b64encode(f.read()).decode("ascii")

with open(LATTE_LOGO_PATH, "rb") as f:
    LATTE_B64 = base64.b64encode(f.read()).decode("ascii")

with open(INDEX_PATH, "r", encoding="utf-8") as f:
    html = f.read()

print(f"Original index.html size: {len(html):,} bytes")

# 1. Update <head> script with base64 logos and safe build tag
logo_js_defs = f"""    window.CALVERSE_LOGO_DARK = "data:image/png;base64,{DARK_B64}";
    window.CALVERSE_LOGO_LATTE = "data:image/png;base64,{LATTE_B64}";
"""

if "window.CALVERSE_LOGO_DARK" not in html:
    # Insert right after `document.documentElement.setAttribute('data-t', bootTheme);`
    target_needle = "document.documentElement.setAttribute('data-t', bootTheme);"
    replacement = target_needle + "\n" + logo_js_defs
    if target_needle in html:
        html = html.replace(target_needle, replacement, 1)
        print("✓ Injected base64 logo data URIs into <head>")
    else:
        print("⚠ Could not find data-t injection needle in <head>")

# Bump build tag
html = re.sub(
    r"const BUILD_TAG\s*=\s*['\"][^'\"]+['\"];",
    "const BUILD_TAG = '20261111_fixed_topbar_assets_v3';",
    html,
    count=1
)
print("✓ Bumped BUILD_TAG to 20261111_fixed_topbar_assets_v3")

# Ensure safe file:// check before location.replace
old_cache_bust = """    // Auto-reload to immediately break browser disk cache
    const BUILD_TAG = '20261111_fixed_topbar_assets_v3';
    if (localStorage.getItem('calverse_build_tag') !== BUILD_TAG) {
      localStorage.setItem('calverse_build_tag', BUILD_TAG);
      const u = new URL(location.href);
      u.searchParams.set('v', Date.now());
      location.replace(u.toString());
      return;
    }"""
new_cache_bust = """    // Auto-reload to immediately break browser disk cache (web only, not inside APK file://)
    const BUILD_TAG = '20261111_fixed_topbar_assets_v3';
    if (location.protocol !== 'file:' && localStorage.getItem('calverse_build_tag') !== BUILD_TAG) {
      localStorage.setItem('calverse_build_tag', BUILD_TAG);
      const u = new URL(location.href);
      u.searchParams.set('v', Date.now());
      location.replace(u.toString());
      return;
    }"""
if old_cache_bust in html:
    html = html.replace(old_cache_bust, new_cache_bust, 1)
    print("✓ Added file:// guard to cache buster")

# 2. Fix Splash Screen in Latte mode (was black #070708)
html = html.replace(
    "[data-t=light] #sp{background:#070708!important;}",
    "[data-t=light] #sp{background:#e4d2bf!important;}\n[data-t=light] #sp .sp-d{background:#744a34!important;box-shadow:0 0 10px rgba(116,74,52,0.4)!important;}"
)
print("✓ Fixed latte splash screen background to #e4d2bf")

# 3. Add .sp-logo-img to CSS latte logo selector
html = html.replace(
    "[data-t=light] .sn-brand-logo-img,\n[data-t=light] .topbar-brand-logo-img,\n[data-t=light] .brand img{content:url('assets/calverse-logo-latte.png')!important;}",
    "[data-t=light] .sn-brand-logo-img,\n[data-t=light] .topbar-brand-logo-img,\n[data-t=light] .sp-logo-img,\n[data-t=light] .brand img{content:url('assets/calverse-logo-latte.png')!important;}"
)

# 4. Fix .topbar styling: position fixed, frosted glass, content scrolls behind
# Update line 82 & 87 topbar backgrounds
html = html.replace(
    "[data-t=black] .topbar{background:linear-gradient(180deg,rgba(14,14,18,.38),rgba(8,8,10,.18))!important;border:none!important;border-bottom:1px solid rgba(224,210,186,.08)!important;backdrop-filter:blur(24px) saturate(200%)!important;-webkit-backdrop-filter:blur(24px) saturate(200%)!important;}",
    "[data-t=black] .topbar{background:linear-gradient(180deg,rgba(7,7,8,.94),rgba(12,14,18,.88))!important;border:none!important;border-bottom:1px solid rgba(224,210,186,.1)!important;box-shadow:0 4px 20px rgba(0,0,0,.35)!important;backdrop-filter:blur(24px) saturate(200%)!important;-webkit-backdrop-filter:blur(24px) saturate(200%)!important;}"
)

html = html.replace(
    "[data-t=light] .topbar{background:linear-gradient(180deg,rgba(246,234,222,.48),rgba(226,208,191,.24))!important;border:none!important;border-bottom:1px solid rgba(131,98,74,.14)!important;backdrop-filter:blur(24px) saturate(200%)!important;-webkit-backdrop-filter:blur(24px) saturate(200%)!important;}",
    "[data-t=light] .topbar{background:linear-gradient(180deg,rgba(228,210,191,.96),rgba(246,234,222,.90))!important;border:none!important;border-bottom:1px solid rgba(131,98,74,.18)!important;box-shadow:0 4px 16px rgba(104,76,56,.12)!important;backdrop-filter:blur(24px) saturate(200%)!important;-webkit-backdrop-filter:blur(24px) saturate(200%)!important;}"
)

# Replace the base .topbar declaration and #app
old_topbar_base = """.topbar{display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;left:0;right:0;z-index:95;width:calc(100% + calc(12px + var(--safe-left)) + calc(12px + var(--safe-right)));margin:0 calc(-1 * (12px + var(--safe-right))) 14px calc(-1 * (12px + var(--safe-left)));padding:max(58px,calc(var(--safe-top,0px) + 18px)) calc(16px + var(--safe-right)) 12px calc(16px + var(--safe-left));border-radius:0!important;background:linear-gradient(180deg,rgba(16,20,28,.48),rgba(10,13,20,.26));border:none!important;border-bottom:1px solid rgba(255,255,255,.08)!important;box-shadow:0 4px 20px rgba(0,0,0,.15);overflow:hidden;backdrop-filter:blur(24px) saturate(200%);-webkit-backdrop-filter:blur(24px) saturate(200%);box-sizing:border-box;}"""

new_topbar_base = """.topbar{display:flex!important;align-items:center!important;justify-content:space-between!important;position:fixed!important;top:0!important;left:0!important;right:0!important;width:100%!important;margin:0!important;z-index:1000!important;padding:max(48px,calc(var(--safe-top,0px) + 12px)) calc(16px + var(--safe-right)) 10px calc(16px + var(--safe-left))!important;border-radius:0!important;background:linear-gradient(180deg,rgba(7,7,8,.94),rgba(12,14,18,.88))!important;border:none!important;border-bottom:1px solid rgba(224,210,186,.1)!important;box-shadow:0 4px 20px rgba(0,0,0,.35)!important;backdrop-filter:blur(24px) saturate(200%)!important;-webkit-backdrop-filter:blur(24px) saturate(200%)!important;box-sizing:border-box!important;}"""

if old_topbar_base in html:
    html = html.replace(old_topbar_base, new_topbar_base, 1)
    print("✓ Replaced base .topbar with fixed positioning")
else:
    print("⚠ old_topbar_base not found exactly")

old_app_base = """#app{position:relative;width:100%;max-width:100%;margin:0 auto;padding:0 calc(12px + var(--safe-right)) calc(112px + var(--safe-bottom)) calc(12px + var(--safe-left));opacity:1;transform:none;transition:opacity .2s ease;z-index:1;min-height:100dvh;overflow-x:clip;box-sizing:border-box;}"""
new_app_base = """#app{position:relative;width:100%;max-width:100%;margin:0 auto;padding:calc(max(48px,calc(var(--safe-top,0px) + 12px)) + 48px) calc(12px + var(--safe-right)) calc(112px + var(--safe-bottom)) calc(12px + var(--safe-left))!important;opacity:1;transform:none;transition:opacity .2s ease;z-index:1;min-height:100dvh;overflow-x:clip;box-sizing:border-box;}
@media (min-width:768px){
  #app{padding-top:0!important;}
  #app>.topbar{display:none!important;}
}"""

if old_app_base in html:
    html = html.replace(old_app_base, new_app_base, 1)
    print("✓ Updated #app padding-top to compensate for fixed topbar")

# Also check max-width:520px #app padding
old_mobile_app = """@media (max-width:520px){\n  #app{max-width:none;padding:0 10px 90px;}"""
new_mobile_app = """@media (max-width:520px){\n  #app{max-width:none;padding:calc(max(48px,calc(var(--safe-top,0px) + 12px)) + 48px) 10px 90px!important;}"""
if old_mobile_app in html:
    html = html.replace(old_mobile_app, new_mobile_app, 1)
    print("✓ Updated mobile 520px #app padding-top")

# Android platform topbar in CSS
old_android_topbar = """  html[data-platform=android-app] .topbar{
    top:0;
    left:0;
    right:0;
    width:calc(100% + calc(12px + var(--safe-left)) + calc(12px + var(--safe-right)));
    margin:0 calc(-1 * (12px + var(--safe-right))) 12px calc(-1 * (12px + var(--safe-left)));
    min-height:52px;
    padding:max(58px,calc(var(--safe-top,0px) + 18px)) calc(14px + var(--safe-right)) 12px calc(14px + var(--safe-left));
    border-radius:0;
    display:flex!important;
    justify-content:space-between!important;
  }"""
new_android_topbar = """  html[data-platform=android-app] .topbar{
    position:fixed!important;
    top:0!important;
    left:0!important;
    right:0!important;
    width:100%!important;
    margin:0!important;
    z-index:1000!important;
    min-height:52px;
    padding:max(48px,calc(var(--safe-top,0px) + 12px)) calc(14px + var(--safe-right)) 10px calc(14px + var(--safe-left))!important;
    border-radius:0!important;
    display:flex!important;
    justify-content:space-between!important;
  }
  html[data-platform=android-app] #app{
    padding-top:calc(max(48px,calc(var(--safe-top,0px) + 12px)) + 48px)!important;
  }"""
if old_android_topbar in html:
    html = html.replace(old_android_topbar, new_android_topbar, 1)
    print("✓ Updated android-app topbar and #app padding")

# 5. Fix HTML elements for Logos (Splash, Topbar, Sidebar) with inline fail-safes
old_sp_html = """<div id="sp"><div class="sp-ring" style="padding:0;overflow:hidden;border:none;background:transparent;"><img src="assets/calverse-logo.png" alt="Calverse" class="sp-logo-img"></div><div class="sp-dots"><div class="sp-d"></div><div class="sp-d"></div><div class="sp-d"></div></div></div>"""
new_sp_html = """<div id="sp"><div class="sp-ring" style="padding:0;overflow:hidden;border:none;background:transparent;"><img src="assets/calverse-logo.png" alt="Calverse" class="sp-logo-img" onerror="this.onerror=null;this.src=(document.documentElement.getAttribute('data-t')==='light'?window.CALVERSE_LOGO_LATTE:window.CALVERSE_LOGO_DARK);"></div><div class="sp-dots"><div class="sp-d"></div><div class="sp-d"></div><div class="sp-d"></div></div></div>
<script>
(()=>{
  try{
    var t=document.documentElement.getAttribute('data-t')||'black';
    var isL=(t==='light');
    var el=document.querySelector('.sp-logo-img');
    if(el){
      el.src=isL?(window.CALVERSE_LOGO_LATTE||'assets/calverse-logo-latte.png'):(window.CALVERSE_LOGO_DARK||'assets/calverse-logo.png');
    }
  }catch(_){}
})();
</script>"""

if old_sp_html in html:
    html = html.replace(old_sp_html, new_sp_html, 1)
    print("✓ Injected splash logo theme sync and fail-safe")

# Topbar brand img
old_tb_brand = """<img src="assets/calverse-logo.png" alt="~" class="topbar-brand-logo-img">"""
new_tb_brand = """<img src="assets/calverse-logo.png" alt="~" class="topbar-brand-logo-img" onerror="this.onerror=null;this.src=(document.documentElement.getAttribute('data-t')==='light'?window.CALVERSE_LOGO_LATTE:window.CALVERSE_LOGO_DARK);">"""
if old_tb_brand in html:
    html = html.replace(old_tb_brand, new_tb_brand, 1)
    print("✓ Updated topbar brand img with onerror fail-safe")

# Sidebar brand img
old_sn_brand = """<img src="assets/calverse-logo.png" alt="~" class="sn-brand-logo-img">"""
new_sn_brand = """<img src="assets/calverse-logo.png" alt="~" class="sn-brand-logo-img" onerror="this.onerror=null;this.src=(document.documentElement.getAttribute('data-t')==='light'?window.CALVERSE_LOGO_LATTE:window.CALVERSE_LOGO_DARK);">"""
if old_sn_brand in html:
    html = html.replace(old_sn_brand, new_sn_brand, 1)
    print("✓ Updated sidebar brand img with onerror fail-safe")

# 6. Update resolveCalverseAsset
old_resolver = """/* ── CALVERSE GIT CDN ASSET RESOLVER (ENSURES ASSETS LOAD ACROSS WEB, APK, MAC, IOS) ── */
const CALVERSE_GIT_CDN_BASE = 'https://cdn.jsdelivr.net/gh/thecalverse/thecalverse@main/';
const CALVERSE_GIT_RAW_BASE = 'https://raw.githubusercontent.com/thecalverse/thecalverse/main/';

function resolveCalverseAsset(path){
  if(!path) return '';
  const p = String(path).trim();
  if(p.startsWith('data:') || p.startsWith('blob:') || p.startsWith('http://') || p.startsWith('https://')){
    return p;
  }
  let clean = p;
  if(clean.startsWith('url(') && clean.endsWith(')')){
    clean = clean.slice(4, -1).replace(/^['"]|['"]$/g, '').trim();
  }
  if(clean.startsWith('data:') || clean.startsWith('blob:') || clean.startsWith('http://') || clean.startsWith('https://')){
    return clean;
  }
  clean = clean.replace(/^(\.\/|\/)/, '');
  return CALVERSE_GIT_CDN_BASE + clean;
}"""

new_resolver = """/* ── CALVERSE ASSET RESOLVER (ENSURES ASSETS LOAD ACROSS WEB, APK, MAC, IOS) ── */
const CALVERSE_CLOUDFLARE_BASE = 'https://thecalverse.com/';

function resolveCalverseAsset(path){
  if(!path) return '';
  let p = String(path).trim();
  if(p.startsWith('data:') || p.startsWith('blob:')){
    return p;
  }
  if(p.startsWith('url(') && p.endsWith(')')){
    p = p.slice(4, -1).replace(/^['"]|['"]$/g, '').trim();
  }
  if(p.startsWith('data:') || p.startsWith('blob:')){
    return p;
  }
  // Strip external cdn / git prefixes if present
  p = p.replace(/^https?:\\/\\/cdn\\.jsdelivr\\.net\\/gh\\/thecalverse\\/thecalverse@[^/]+\\//, '');
  p = p.replace(/^https?:\\/\\/raw\\.githubusercontent\\.com\\/thecalverse\\/thecalverse\\/[^/]+\\//, '');
  p = p.replace(/^https?:\\/\\/thecalverse\\.com\\//, '');
  if(p.startsWith('http://') || p.startsWith('https://')){
    return p;
  }
  let clean = p.replace(/^(\\.\\/|\\/)/, '');
  if(!clean.startsWith('assets/')){
    clean = 'assets/' + clean;
  }

  // Inside Android WebView (file:///android_asset/V17.html) or native Mac app
  if(location.protocol === 'file:' || window.CalverseBridge || (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.includes('CalverseBridge'))){
    return clean;
  }

  // On website: root-relative path '/assets/...' to avoid subpath resolution errors (/journal/assets/...)
  return '/' + clean;
}"""

if old_resolver in html:
    html = html.replace(old_resolver, new_resolver, 1)
    print("✓ Replaced resolveCalverseAsset with reliable local/web resolver")
else:
    print("⚠ old_resolver not found exactly")

# 7. Update renderStickersBox fallbacks
old_stk_render = """    const items = GRAPHIC_STICKERS.map(s => {
      const resolved = resolveCalverseAsset(s.src);
      const fallback = s.rawLocalSrc || s.src;
      return `
      <div class="graphic-sticker-card" onclick="insertGraphicStickerToJournal('${resolved}', '${escapeHtml(s.name)}')" title="${escapeHtml(s.name)} - Click to place on page">
        <img src="${resolved}" alt="${escapeHtml(s.name)}" onerror="if(!this.dataset.fallback){this.dataset.fallback=1;this.src='${fallback}';}">
      </div>
    `;}).join('');"""

new_stk_render = """    const items = GRAPHIC_STICKERS.map(s => {
      const resolved = resolveCalverseAsset(s.src);
      const cleanPath = (s.rawLocalSrc || s.src).replace(/^(\\.\\/|\\/)/, '');
      const cloudflareFallback = 'https://thecalverse.com/' + cleanPath;
      return `
      <div class="graphic-sticker-card" onclick="insertGraphicStickerToJournal('${resolved}', '${escapeHtml(s.name)}')" title="${escapeHtml(s.name)} - Click to place on page">
        <img src="${resolved}" alt="${escapeHtml(s.name)}" onerror="if(!this.dataset.triedFallback){this.dataset.triedFallback=1;this.src='${cloudflareFallback}';}">
      </div>
    `;}).join('');"""

if old_stk_render in html:
    html = html.replace(old_stk_render, new_stk_render, 1)
    print("✓ Updated renderStickersBox with robust Cloudflare fallback")
else:
    print("⚠ old_stk_render not found exactly")

# 8. Update renderJournalBackgroundGrid fallbacks
old_bg_render = """    const previewInner = isCssPaper
      ? `<div class="journal-bg-card-preview" style="${bgCss}"></div>`
      : `<div class="journal-bg-card-preview"><img src="${resolvedThumb || resolvedVal}" class="journal-bg-card-img" alt="${escapeHtml(bg.name)}" onerror="if(!this.dataset.fallback){this.dataset.fallback=1;this.src='${bg.rawLocalValue || bg.value}';}"></div>`;"""

new_bg_render = """    const cleanThumb = (bg.rawLocalThumb || bg.rawLocalValue || bg.thumb || bg.value).replace(/^(\\.\\/|\\/)/, '');
    const cloudflareFallback = 'https://thecalverse.com/' + cleanThumb;

    const previewInner = isCssPaper
      ? `<div class="journal-bg-card-preview" style="${bgCss}"></div>`
      : `<div class="journal-bg-card-preview"><img src="${resolvedThumb || resolvedVal}" class="journal-bg-card-img" alt="${escapeHtml(bg.name)}" onerror="if(!this.dataset.triedFallback){this.dataset.triedFallback=1;this.src='${cloudflareFallback}';}"></div>`;"""

if old_bg_render in html:
    html = html.replace(old_bg_render, new_bg_render, 1)
    print("✓ Updated renderJournalBackgroundGrid with robust Cloudflare fallback")
else:
    print("⚠ old_bg_render not found exactly")

# 9. Update theme switcher logo updates in JS
old_theme_sync1 = """  document.querySelectorAll('.sn-brand-logo-img, .topbar-brand-logo-img').forEach(img => {
    img.src = isLight ? 'assets/calverse-logo-latte.png' : 'assets/calverse-logo.png';
  });"""
new_theme_sync1 = """  document.querySelectorAll('.sn-brand-logo-img, .topbar-brand-logo-img, .sp-logo-img, .brand img').forEach(img => {
    img.src = isLight ? 'assets/calverse-logo-latte.png' : 'assets/calverse-logo.png';
    img.onerror = function() {
      this.onerror = null;
      this.src = isLight ? window.CALVERSE_LOGO_LATTE : window.CALVERSE_LOGO_DARK;
    };
  });"""

html = html.replace(old_theme_sync1, new_theme_sync1)
print("✓ Updated theme switcher JS logo updates")

with open(INDEX_PATH, "w", encoding="utf-8") as f:
    f.write(html)
print(f"✓ Saved updated index.html ({len(html):,} bytes)")

# Sync to app.html
with open(APP_PATH, "w", encoding="utf-8") as f:
    f.write(html)
print(f"✓ Synchronized app.html (byte-identical)")
