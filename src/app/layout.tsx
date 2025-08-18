import "./globals.css";
import { SupabaseAuthProvider } from "@/lib/contexts/SupabaseAuthContext";

export const metadata = {
  title: "BaliyoBan",
  description: "Your personal fitness companion - train like an animal",
  manifest: "/manifest.json?v=2",
  themeColor: "#FFFFFF",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Baliyoban",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-256x256.png", sizes: "256x256", type: "image/png" },
      { url: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="Astronaut Fitness" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AstroFit" />
        <meta name="description" content="Your personal fitness companion - train like an astronaut" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#FFFFFF" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#FFFFFF" />

        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#FFFFFF" />
        <link rel="shortcut icon" href="/icons/icon-192x192.png" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://your-domain.com" />
        <meta name="twitter:title" content="Astronaut Fitness" />
        <meta name="twitter:description" content="Your personal fitness companion - train like an astronaut" />
        <meta name="twitter:image" content="https://your-domain.com/icons/icon-192x192.png" />
        <meta name="twitter:creator" content="@yourusername" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Astronaut Fitness" />
        <meta property="og:description" content="Your personal fitness companion - train like an astronaut" />
        <meta property="og:site_name" content="Astronaut Fitness" />
        <meta property="og:url" content="https://your-domain.com" />
        <meta property="og:image" content="https://your-domain.com/icons/icon-192x192.png" />
      </head>
      <body>
        <SupabaseAuthProvider>
          {children}
        </SupabaseAuthProvider>
      </body>
    </html>
  );
}
