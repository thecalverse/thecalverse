#!/usr/bin/env python3
"""
Generate a luxury coffee-table master PDF containing ALL 134 Calverse posters
created across all features, modules, and campaigns.
"""

import os
import glob
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ART_DIR = "/Users/maddhamsolanki/.gemini/antigravity/brain/be6235b4-47e3-4e08-a3c9-4f2598361eed"
PROJECT_ROOT = "/Users/maddhamsolanki/.gemini/antigravity/scratch/thecalverse"
DESKTOP_PDF = os.path.expanduser("~/Desktop/Calverse_All_Posters.pdf")
ASSETS_PDF = os.path.join(PROJECT_ROOT, "assets", "Calverse_All_Posters.pdf")
ARTIFACT_PDF = os.path.join(ART_DIR, "Calverse_All_Posters.pdf")

W, H = 1200, 1500 # Consistent 4:5 luxury canvas

# Fonts
FONT_TITLE = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia.ttf", 64)
FONT_SUBTITLE = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia.ttf", 32)
FONT_HEADING = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia.ttf", 44)
FONT_BODY = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 22)
FONT_SMALL = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 16)
FONT_MONO = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 18)

# Colors
BG_DARK = (15, 16, 21)
TEXT_WHITE = (247, 243, 237)
TEXT_MUTED = (165, 168, 182)
ACCENT_PURPLE = (140, 126, 255)
BORDER_COLOR = (42, 45, 58)

def create_cover_page(logo_img):
    page = Image.new("RGB", (W, H), BG_DARK)
    draw = ImageDraw.Draw(page)

    # Decorative border frame
    draw.rounded_rectangle([36, 36, W - 36, H - 36], radius=24, outline=BORDER_COLOR, width=2)
    draw.rounded_rectangle([44, 44, W - 44, H - 44], radius=18, outline=(25, 27, 36), width=1)

    # Place Logo
    if logo_img:
        logo_thumb = logo_img.resize((160, 160), Image.Resampling.LANCZOS)
        page.paste(logo_thumb, ((W - 160) // 2, 220), logo_thumb if logo_thumb.mode == "RGBA" else None)

    # Title & Subtitle
    draw.text((W // 2, 440), "CALVERSE", fill=TEXT_WHITE, font=FONT_TITLE, anchor="mm")
    draw.text((W // 2, 510), "THE CREATIVE POSTER ARCHIVE", fill=ACCENT_PURPLE, font=FONT_SUBTITLE, anchor="mm")

    # Divider line
    draw.line([(W // 2 - 120, 560), (W // 2 + 120, 560)], fill=(70, 75, 95), width=2)

    # Overview text
    draw.text((W // 2, 610), "134 Original Academic Sanctuary Posters & Artworks", fill=TEXT_WHITE, font=FONT_BODY, anchor="mm")
    draw.text((W // 2, 645), "STEM Solvers • Focus Timers • Daily Habits • Digital Journal • Study Notes • Library", fill=TEXT_MUTED, font=FONT_SMALL, anchor="mm")

    # Box with collections summary
    box_top = 730
    box_w = 900
    box_x = (W - box_w) // 2
    draw.rounded_rectangle([box_x, box_top, box_x + box_w, box_top + 460], radius=16, fill=(20, 22, 30), outline=BORDER_COLOR, width=1)

    sections = [
        ("Collection I", "Core Module Title Posters (Portrait & Square)", "12 Posters"),
        ("Collection II", "Ornate Study Pillar Posters (Portrait 4:5 Edition)", "36 Posters"),
        ("Collection III", "Ornate Study Pillar Posters (Square 1:1 Edition)", "36 Posters"),
        ("Collection IV", "Dark Academic Meme Series (Overthinking & Procrastination)", "14 Posters"),
        ("Collection V", "Clean Minimalist Study Desk Series", "24 Posters"),
        ("Collection VI", "Official Ad Campaigns & Feature Spotlights", "12 Posters"),
    ]

    draw.text((box_x + 36, box_top + 34), "COLLECTIONS INDEX", fill=ACCENT_PURPLE, font=ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 17), anchor="lm")
    draw.text((box_x + box_w - 36, box_top + 34), "TOTAL: 134 ARTWORKS", fill=TEXT_MUTED, font=FONT_SMALL, anchor="rm")
    draw.line([(box_x + 36, box_top + 56), (box_x + box_w - 36, box_top + 56)], fill=BORDER_COLOR, width=1)

    y_offset = box_top + 92
    for num, title, count in sections:
        draw.text((box_x + 36, y_offset), num, fill=ACCENT_PURPLE, font=FONT_MONO, anchor="lm")
        draw.text((box_x + 210, y_offset), title, fill=TEXT_WHITE, font=FONT_BODY, anchor="lm")
        draw.text((box_x + box_w - 36, y_offset), count, fill=TEXT_MUTED, font=FONT_SMALL, anchor="rm")
        y_offset += 60

    # Footer
    draw.text((W // 2, H - 90), "Built with focus & calm • thecalverse.com • India", fill=TEXT_MUTED, font=FONT_SMALL, anchor="mm")
    return page

def create_divider_page(col_num, col_title, col_subtitle, poster_count):
    page = Image.new("RGB", (W, H), BG_DARK)
    draw = ImageDraw.Draw(page)

    draw.rounded_rectangle([36, 36, W - 36, H - 36], radius=24, outline=BORDER_COLOR, width=2)
    draw.rounded_rectangle([44, 44, W - 44, H - 44], radius=18, outline=(25, 27, 36), width=1)

    draw.text((W // 2, H // 2 - 140), f"COLLECTION {col_num}", fill=ACCENT_PURPLE, font=FONT_MONO, anchor="mm")
    draw.text((W // 2, H // 2 - 60), col_title, fill=TEXT_WHITE, font=FONT_HEADING, anchor="mm")
    draw.line([(W // 2 - 100, H // 2), (W // 2 + 100, H // 2)], fill=(80, 85, 110), width=2)
    draw.text((W // 2, H // 2 + 50), col_subtitle, fill=TEXT_MUTED, font=FONT_BODY, anchor="mm")
    draw.text((W // 2, H // 2 + 95), f"Featuring {poster_count} High-Resolution Master Posters", fill=ACCENT_PURPLE, font=FONT_SMALL, anchor="mm")

    draw.text((W // 2, H - 90), "CALVERSE • AESTHETIC ACADEMIC SUITE", fill=(100, 105, 125), font=FONT_SMALL, anchor="mm")
    return page

def render_poster_page(poster_path, section_name, poster_num, total_in_section):
    page = Image.new("RGB", (W, H), BG_DARK)
    draw = ImageDraw.Draw(page)

    # Top header bar
    header_text = f"CALVERSE CREATIVE ARCHIVE • {section_name.upper()} • {poster_num} OF {total_in_section}"
    draw.text((60, 48), header_text, fill=ACCENT_PURPLE, font=FONT_SMALL, anchor="lm")
    draw.line([(60, 68), (W - 60, 68)], fill=BORDER_COLOR, width=1)

    # Load poster image
    poster = Image.open(poster_path).convert("RGBA")
    pw, ph = poster.size

    # Target area
    max_w = W - 100
    max_h = H - 160

    # Scale to fit
    ratio = min(max_w / pw, max_h / ph)
    new_w = int(pw * ratio)
    new_h = int(ph * ratio)

    resized_poster = poster.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # Position centered in available area
    px = (W - new_w) // 2
    py = 86 + (max_h - new_h) // 2

    # Draw subtle shadow box
    draw.rounded_rectangle([px - 4, py - 4, px + new_w + 4, py + new_h + 4], radius=16, fill=(10, 11, 15), outline=BORDER_COLOR, width=1)

    # Paste poster
    page.paste(resized_poster, (px, py), resized_poster if resized_poster.mode == "RGBA" else None)

    # Footer
    filename_clean = os.path.basename(poster_path).replace(".png", "").replace("_", " ").title()
    draw.line([(60, H - 56), (W - 60, H - 56)], fill=BORDER_COLOR, width=1)
    draw.text((60, H - 36), filename_clean, fill=TEXT_MUTED, font=FONT_SMALL, anchor="lm")
    draw.text((W - 60, H - 36), "thecalverse.com", fill=ACCENT_PURPLE, font=FONT_SMALL, anchor="rm")

    return page

def main():
    print("--- 📚 Starting Calverse Master Poster PDF Generation ---")
    pages = []

    # Logo
    logo_path = os.path.join(PROJECT_ROOT, "assets", "calverse-logo.png")
    logo_img = Image.open(logo_path).convert("RGBA") if os.path.exists(logo_path) else None

    # 1. Cover Page
    print("Generating Cover Page...")
    pages.append(create_cover_page(logo_img))

    # Collections Definition
    collections = [
        {
            "num": "I",
            "title": "Core Module Titles",
            "subtitle": "Flagship Module Covers • Portrait & Square Formats",
            "files": sorted(glob.glob(f"{ART_DIR}/core4_pt_*.png")) + sorted(glob.glob(f"{ART_DIR}/core4_sq_*.png")),
        },
        {
            "num": "II",
            "title": "Ornate Portrait Posters",
            "subtitle": "Handcrafted Typography & Aesthetic Academic Pillars (4:5 Ratio)",
            "files": (
                sorted(glob.glob(f"{ART_DIR}/ornate_pt_calculators_*.png")) +
                sorted(glob.glob(f"{ART_DIR}/ornate_pt_timer_*.png")) +
                sorted(glob.glob(f"{ART_DIR}/ornate_pt_habits_*.png")) +
                sorted(glob.glob(f"{ART_DIR}/ornate_pt_notes_*.png")) +
                sorted(glob.glob(f"{ART_DIR}/ornate_pt_journal_*.png")) +
                sorted(glob.glob(f"{ART_DIR}/ornate_pt_library_*.png"))
            ),
        },
        {
            "num": "III",
            "title": "Ornate Square Posters",
            "subtitle": "Social & Desk Square Visuals Across All 6 Academic Modules (1:1 Ratio)",
            "files": (
                sorted(glob.glob(f"{ART_DIR}/ornate_sq_calculators_*.png")) +
                sorted(glob.glob(f"{ART_DIR}/ornate_sq_timer_*.png")) +
                sorted(glob.glob(f"{ART_DIR}/ornate_sq_habits_*.png")) +
                sorted(glob.glob(f"{ART_DIR}/ornate_sq_notes_*.png")) +
                sorted(glob.glob(f"{ART_DIR}/ornate_sq_journal_*.png")) +
                sorted(glob.glob(f"{ART_DIR}/ornate_sq_library_*.png"))
            ),
        },
        {
            "num": "IV",
            "title": "Dark Academic Memes",
            "subtitle": "3 AM Overthinking, Wikipedia Rabbit Holes & Midnight Breakthroughs",
            "files": (
                sorted(glob.glob(f"{ART_DIR}/journal_dark_*.png")) +
                sorted(glob.glob(f"{ART_DIR}/timer_dark_*.png"))
            ),
        },
        {
            "num": "V",
            "title": "Clean Study Sanctuary",
            "subtitle": "Minimalist Obsidian Workspace & Focus Desk Edition",
            "files": sorted(glob.glob(f"{ART_DIR}/clean_*.png")),
        },
        {
            "num": "VI",
            "title": "Official Ad Campaigns",
            "subtitle": "Launch Posters, Dual Theme Showcases & App Spotlights",
            "files": sorted(glob.glob(f"{ART_DIR}/ad_*.png")),
        },
    ]

    total_posters = sum(len(c["files"]) for c in collections)
    print(f"Total posters to process: {total_posters}")

    for c in collections:
        print(f"\nProcessing Collection {c['num']}: {c['title']} ({len(c['files'])} posters)...")
        # Add section divider
        divider = create_divider_page(c["num"], c["title"], c["subtitle"], len(c["files"]))
        pages.append(divider)

        # Add each poster
        for idx, ppath in enumerate(c["files"], 1):
            poster_page = render_poster_page(ppath, c["title"], idx, len(c["files"]))
            pages.append(poster_page)

    print(f"\nTotal assembled pages: {len(pages)}")
    print(f"Saving master PDF to {DESKTOP_PDF}...")

    # Save to Desktop first
    pages[0].save(
        DESKTOP_PDF,
        save_all=True,
        append_images=pages[1:],
        quality=92,
        optimize=True,
        resolution=150.0
    )

    # Save to assets and artifact dir as well
    os.makedirs(os.path.dirname(ASSETS_PDF), exist_ok=True)
    import shutil
    shutil.copyfile(DESKTOP_PDF, ASSETS_PDF)
    shutil.copyfile(DESKTOP_PDF, ARTIFACT_PDF)

    pdf_size_mb = os.path.getsize(DESKTOP_PDF) / (1024 * 1024)
    print(f"✅ SUCCESS! Master PDF generated successfully!")
    print(f"   📄 Pages: {len(pages)}")
    print(f"   🖼️ Posters included: {total_posters}")
    print(f"   📦 File Size: {pdf_size_mb:.2f} MB")
    print(f"   📍 Saved Locations:")
    print(f"      1) {DESKTOP_PDF}")
    print(f"      2) {ASSETS_PDF}")
    print(f"      3) {ARTIFACT_PDF}")

if __name__ == "__main__":
    main()
