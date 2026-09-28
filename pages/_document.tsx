import { Html, Head, Main, NextScript } from "next/document";

/**
 * Custom _document.tsx to inject PWA + iOS Safari meta tags.
 * This makes /journey installable on an iPhone via Safari - Share - Add to Home Screen.
 * Result: full-screen app-like launch with no browser chrome, home-screen icon, theme color.
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#5B4CE0" />
        <meta name="application-name" content="Habitnu" />

        {/* iOS-specific PWA meta */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Habitnu" />
        <meta name="format-detection" content="telephone=no" />

        {/* Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />
        <link rel="shortcut icon" href="/icons/favicon-32.png" />

        {/* Viewport hardening for iOS (no zoom on inputs, safe-area support) */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
