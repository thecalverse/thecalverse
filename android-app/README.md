# Calverse Android App

This directory contains the standalone Android build for Calverse.

## Files
- `Calverse.apk`: The latest signed debug APK for mobile and tablet devices.
- `calverse-v17-debug.apk`: Alias build for backward compatibility.
- `calverse-base.apk`: Template wrapper package containing Android native runtime and bridge.

## How It Works
The Android APK loads the embedded WebView asset `assets/V17.html` with:
- Full responsive support for **mobile phones** and **tablets** (portrait & landscape).
- Native bridge interface `window.CalverseBridge` for screen orientation locking/clearing.
- Live web ad unit tags removed for clean offline/native app experience.
- All offline tools (calculators, scientific formulas, tracker, timer, notes, journal, library).

## How to Rebuild & Sync
Whenever changes are made to `index.html` on the website, simply run:
```bash
./scripts/build_android_apk.sh
```
or
```bash
python3 scripts/build_android_apk.py
```
This automatically updates `V17.html`, repackages the APK, aligns it with `zipalign`, and signs it with your local Android debug keystore.
