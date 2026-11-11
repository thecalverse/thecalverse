#!/usr/bin/env python3
import os
import shutil
import subprocess
from PIL import Image, ImageFilter, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOADED_IMG = "/Users/maddhamsolanki/.gemini/antigravity/brain/be6235b4-47e3-4e08-a3c9-4f2598361eed/.user_uploaded/media_1794331827611_0797ffe6.jpg"

print(f"Reading uploaded logo from: {UPLOADED_IMG}")
orig = Image.open(UPLOADED_IMG).convert("RGBA")
w, h = orig.size

# 1. Cleanly extract the wave symbol
wave_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
for y in range(h):
    for x in range(w):
        r, g, b, a = orig.getpixel((x, y))
        if r > 165 and g > 160 and b > 155:
            brightness = (r + g + b) / 3
            alpha = int(min(255, max(0, (brightness - 140) * (255 / (240 - 140)))))
            wave_layer.putpixel((x, y), (247, 243, 237, alpha))

wbox = wave_layer.getbbox()
wave_crop = wave_layer.crop(wbox)
print(f"✓ Extracted wave symbol: {wave_crop.size}")

# 2. Build 2x supersampled squircle mask (zero white border ring!)
SS = 2
S_SIZE = 1024 * SS
R = int(228 * SS) # Corner radius
margin = int(28 * SS)

mask = Image.new("L", (S_SIZE, S_SIZE), 0)
draw = ImageDraw.Draw(mask)
draw.rounded_rectangle([margin, margin, S_SIZE - margin, S_SIZE - margin], radius=R, fill=255)
final_mask = mask.resize((1024, 1024), Image.Resampling.LANCZOS)

# 3. DARK SQUIRCLE: Dark dark grey (#222225 -> 34, 34, 37) - NO WHITE BORDER!
dark_bg = Image.new("RGBA", (1024, 1024), (34, 34, 37, 255))
wx = (1024 - wave_crop.width) // 2
wy = (1024 - wave_crop.height) // 2
dark_bg.paste(wave_crop, (wx, wy), wave_crop)
dark_logo = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
dark_logo.paste(dark_bg, (0, 0), final_mask)

# 4. LATTE SQUIRCLE: Warm rich espresso (#3b2a1d -> 59, 42, 29) with cream wave
latte_bg = Image.new("RGBA", (1024, 1024), (59, 42, 29, 255))
latte_bg.paste(wave_crop, (wx, wy), wave_crop)
latte_logo = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
latte_logo.paste(latte_bg, (0, 0), final_mask)

# 5. Save Assets in assets/
assets_dir = os.path.join(ROOT, "assets")
os.makedirs(assets_dir, exist_ok=True)

dark_logo.save(os.path.join(assets_dir, "calverse-logo.png"), "PNG")
dark_logo.save(os.path.join(assets_dir, "calverse-logo-in-box-transparent.png"), "PNG")
dark_logo.save(os.path.join(assets_dir, "calverse-logo-original.png"), "PNG")
latte_logo.save(os.path.join(assets_dir, "calverse-logo-latte.png"), "PNG")
wave_crop.save(os.path.join(assets_dir, "calverse-wave-symbol.png"), "PNG")
print("✓ Saved all high-res assets in assets/ (dark & latte)")

# 6. Save Google Search Favicons (Multiples of 48px square as required by Google)
google_favicon_sizes = [
    ("favicon-48x48.png", 48),
    ("favicon-96x96.png", 96),
    ("favicon-144x144.png", 144),
    ("favicon-192x192.png", 192),
    ("favicon-512x512.png", 512),
    ("favicon.png", 48),
    ("apple-touch-icon.png", 180),
]

for filename, sz in google_favicon_sizes:
    fav = dark_logo.resize((sz, sz), Image.Resampling.LANCZOS)
    fav.save(os.path.join(ROOT, filename), "PNG")
print("✓ Generated Google Search favicons (48x48, 96x96, 144x144, 192x192, 512x512, apple-touch-icon)")

# Multi-resolution ICO (16, 32, 48, 64, 128, 256)
ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
ico_imgs = [dark_logo.resize(s, Image.Resampling.LANCZOS) for s in ico_sizes]
ico_imgs[0].save(
    os.path.join(ROOT, "favicon.ico"),
    format="ICO",
    sizes=ico_sizes,
    append_images=ico_imgs[1:]
)
print("✓ Generated multi-resolution favicon.ico")

# 7. Generate macOS AppIcon.icns
iconset_dir = os.path.join(ROOT, "desktop-app", "extracted_icns", "app.iconset")
os.makedirs(iconset_dir, exist_ok=True)

mac_sizes = [
    ("icon_16x16.png", 16),
    ("icon_16x16@2x.png", 32),
    ("icon_32x32.png", 32),
    ("icon_32x32@2x.png", 64),
    ("icon_128x128.png", 128),
    ("icon_128x128@2x.png", 256),
    ("icon_256x256.png", 256),
    ("icon_256x256@2x.png", 512),
    ("icon_512x512.png", 512),
    ("icon_512x512@2x.png", 1024),
]

for filename, sz in mac_sizes:
    target_path = os.path.join(iconset_dir, filename)
    resized = dark_logo.resize((sz, sz), Image.Resampling.LANCZOS)
    resized.save(target_path, "PNG")

icns_output = os.path.join(ROOT, "desktop-app", "AppIcon.icns")
try:
    subprocess.run(["iconutil", "-c", "icns", iconset_dir, "-o", icns_output], check=True)
    print(f"✓ Successfully compiled {icns_output} with iconutil")
except Exception as e:
    print(f"⚠️ Error running iconutil: {e}")

# 8. Android Mipmap Icons
android_icons_dir = os.path.join(ROOT, "android-app", "extracted_icons")
os.makedirs(android_icons_dir, exist_ok=True)

android_sizes = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192
}

for density, sz in android_sizes.items():
    density_dir = os.path.join(android_icons_dir, f"mipmap-{density}-v4")
    os.makedirs(density_dir, exist_ok=True)
    sq = dark_logo.resize((sz, sz), Image.Resampling.LANCZOS)
    sq.save(os.path.join(density_dir, "ic_launcher.png"), "PNG")
    circle_mask = Image.new("L", (sz, sz), 0)
    cdraw = ImageDraw.Draw(circle_mask)
    cdraw.ellipse((0, 0, sz - 1, sz - 1), fill=255)
    rd = sq.copy()
    rd_alpha = rd.split()[3]
    combined_alpha = Image.composite(rd_alpha, Image.new("L", (sz, sz), 0), circle_mask)
    rd.putalpha(combined_alpha)
    rd.save(os.path.join(density_dir, "ic_launcher_round.png"), "PNG")

print("✓ Generated Android mipmap icons in android-app/extracted_icons/")
print("\nAll icons and logos regenerated with ZERO white border & full Google Favicon support!")
