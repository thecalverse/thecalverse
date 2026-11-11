# Calverse Android App

This directory contains the standalone Android build for Calverse.

## Package Info
- **Package Name (Application ID):** `com.thecalverse`
- **Main Activity:** `com.calverse.app.v17.MainActivity`
- **Version Name:** `1.7-v17`
- **Version Code:** `17`

## Files
- `Calverse.aab`: The signed **Android App Bundle (.aab)** for uploading directly to **Google Play Console**. Google Play dynamically generates device-specific APKs for phones and tablets from this single bundle.
- `Calverse.apk` & `Calverse-Tablet-and-Phone.apk`: The signed unified APK for direct installation/sideloading onto **mobile phones** and **tablets** (supports `small`, `normal`, `large`, and `xlarge` screens).
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
