# Blog Publisher iPhone App

This is an Expo iOS shell for Blog Publisher. It loads the deployed platform in a native WebView with a mobile header, loading state, retry, pull-to-refresh, and external-link handling.

## Run Locally

```bash
cd apps/ios
npm install
npm run start
```

Open the project with Expo Go on iPhone, or run `npm run ios` on macOS with Xcode.

## Configure Target URL

By default the app opens:

```text
https://blog-publisher-ic6i.onrender.com
```

Override it for local or staging builds:

```bash
EXPO_PUBLIC_BLOG_PUBLISHER_URL=http://localhost:52344 npm run start
```

For a physical iPhone, use a LAN-accessible URL instead of `localhost`.

## Production Build

Use EAS Build when Apple credentials are ready:

```bash
npx eas build --platform ios
```
