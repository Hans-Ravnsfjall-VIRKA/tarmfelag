# Tarmfelagið native app (Capacitor)

The native app is the same React code as the web app, wrapped by Capacitor.
Only the frontend is bundled. Supabase stays remote. The admin (`#admin`) and
access log (`#atgongd-2026`) are not in the native bundle and keep living on the
Netlify web build.

## Daily workflow

- Change screens as usual in `src/`. Nothing native needs touching.
- Web: `npm run build` (unchanged, Netlify deploys it).
- Native: `npm run cap:ios` or `npm run cap:android`. This builds the native
  bundle (`dist-native`), syncs it into the platform projects and opens Xcode or
  Android Studio.
- Test the native bundle in a browser: `npx vite --mode native`.
- New native plugin: `npm i @capacitor/<name>`, then `npm run cap:sync`.
- Native-only code goes behind `__NATIVE__` (or `IS_NATIVE` from `src/lib/platform.js`).
- Icons and splash: replace the PNGs in `assets/`, then `npm run cap:assets`.

## Fixed choices

- App id `fo.tarmfelag.app`. It cannot change after the first store upload.
- Name `Tarmfelagið`, web dir `dist-native`, config in `capacitor.config.json`.

## Before first release

1. Apple Developer account (99 USD per year) and Google Play Console (25 USD once).
2. A public privacy policy URL. The native app does not log visits or send IP
   data to third parties. It uses the device location on the device only, and
   sends anonymous reviews and reports to your Supabase project.
3. Apple guideline 1.2 (user generated content): reviews and reports are
   anonymous text. Describe the moderation in the review notes (you remove
   content in the admin) and consider a visible "report" action on reviews.
4. App Privacy (Apple) and Data safety (Google): location is used for app
   function and not stored. User content (reviews, reports) is collected.
5. Xcode: set Team, bundle id, version and build; Product, Archive, upload.
   Android Studio: Build, Generate Signed Bundle (.aab), keep the keystore safe.
6. Screenshots (6.9 and 6.5 inch iPhone, plus phone for Play), description in
   Faroese and English, support URL, age rating, test notes.
7. Raise the version each release: iOS build number in Xcode, `versionCode` and
   `versionName` in `android/app/build.gradle`.
