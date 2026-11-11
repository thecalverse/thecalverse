#!/usr/bin/env python3
import os
import shutil
import subprocess
from collections import deque
from PIL import Image, ImageFilter, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOADED_IMG = "/Users/maddhamsolanki/.gemini/antigravity/brain/be6235b4-47e3-4e08-a3c9-4f2598361eed/.user_uploaded/media_1794331827611_0797ffe6.jpg"

print(f"Reading uploaded logo from: {UPLOADED_IMG}")
src = Image.open(UPLOADED_IMG).convert("RGBA")
w, h = src.size

# 1. Create Transparent Squircle Mask
# Flood fill from the 4 corners for dark pixels (max(r,g,b) <= 18)
gray = src.convert("L")
mask = Image.new("L", (w, h), 255)

visited = bytearray(w * h)
q = deque([(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)])
for x, y in q:
    visited[y * w + x] = 1

while q:
    cx, cy = q.popleft()
    mask.putpixel((cx, cy), 0)
    for nx, ny in [(cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)]:
        if 0 <= nx < w and 0 <= ny < h:
            idx = ny * w + nx
            if not visited[idx]:
                visited[idx] = 1
                val = gray.getpixel((nx, ny))
                if val <= 18:
                    q.append((nx, ny))

# Soft 0.8px Gaussian feather for smooth antialiased boundary
smooth_mask = mask.filter(ImageFilter.GaussianBlur(radius=0.8))

logo_transparent = src.copy()
logo_transparent.putalpha(smooth_mask)

# 2. Extract Wave Symbol
wave_img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
for y in range(h):
    for x in range(w):
        r, g, b, a = src.getpixel((x, y))
        if r > 160 and g > 155 and b > 150:
            wave_img.putpixel((x, y), (r, g, b, 255))
w_box = wave_img.getbbox()
if w_box:
    wave_cropped = wave_img.crop(w_box)
else:
    wave_cropped = wave_img

# 3. Save Assets
assets_dir = os.path.join(ROOT, "assets")
os.makedirs(assets_dir, exist_ok=True)

logo_transparent.save(os.path.join(assets_dir, "calverse-logo.png"), "PNG")
logo_transparent.save(os.path.join(assets_dir, "calverse-logo-in-box-transparent.png"), "PNG")
src.save(os.path.join(assets_dir, "calverse-logo-original.png"), "PNG")
src.save(os.path.join(assets_dir, "calverse-logo-in-box-original.png"), "PNG")
wave_cropped.save(os.path.join(assets_dir, "calverse-wave-symbol.png"), "PNG")
print("✓ Saved all high-res assets in assets/")

# 4. Save Root Web Icons (favicon.ico, favicon.png, apple-touch-icon.png)
favicon_32 = logo_transparent.resize((32, 32), Image.Resampling.LANCZOS)
favicon_32.save(os.path.join(ROOT, "favicon.png"), "PNG")

apple_touch = logo_transparent.resize((180, 180), Image.Resampling.LANCZOS)
apple_touch.save(os.path.join(ROOT, "apple-touch-icon.png"), "PNG")

# Multi-resolution ICO (16, 32, 48, 64)
ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
ico_imgs = [logo_transparent.resize(s, Image.Resampling.LANCZOS) for s in ico_sizes]
ico_imgs[0].save(
    os.path.join(ROOT, "favicon.ico"),
    format="ICO",
    sizes=ico_sizes,
    append_images=ico_imgs[1:]
)
print("✓ Generated favicon.ico, favicon.png, apple-touch-icon.png")

# 5. Generate macOS AppIcon.icns
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
    resized = logo_transparent.resize((sz, sz), Image.Resampling.LANCZOS)
    resized.save(target_path, "PNG")

icns_output = os.path.join(ROOT, "desktop-app", "AppIcon.icns")
try:
    subprocess.run(["iconutil", "-c", "icns", iconset_dir, "-o", icns_output], check=True)
    print(f"✓ Successfully compiled {icns_output} with iconutil")
except Exception as e:
    print(f"⚠️ Error running iconutil: {e}")

# 6. Android Mipmap Icons
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
    # Standard square launcher
    sq = logo_transparent.resize((sz, sz), Image.Resampling.LANCZOS)
    sq.save(os.path.join(density_dir, "ic_launcher.png"), "PNG")
    # Round launcher (with circle mask)
    circle_mask = Image.new("L", (sz, sz), 0)
    draw = ImageDraw.Draw(circle_mask)
    draw.ellipse((0, 0, sz - 1, sz - 1), fill=255)
    rd = sq.copy()
    # Combine existing alpha with circle mask
    rd_alpha = rd.split()[3]
    combined_alpha = Image.composite(rd_alpha, Image.new("L", (sz, sz), 0), circle_mask)
    rd.putalpha(combined_alpha)
    rd.save(os.path.join(density_dir, "ic_launcher_round.png"), "PNG")

print("✓ Generated Android mipmap icons in android-app/extracted_icons/")
print("\nAll icons and logos generated successfully!")
