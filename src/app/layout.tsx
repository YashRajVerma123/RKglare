// src/app/layout.tsx
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import "src/app/globals.css"; // Corrected import path
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import PageLoader from "@/components/page-loader";
import { Suspense } from "react";
import SplashScreen from "@/components/splash-screen";
import Script from "next/script";
import { spaceGrotesk, workSans, dancingScript, nunito } from "./fonts";
import ProvidersWrapper from "@/components/providers-wrapper"; // Path to the client-side wrapper

export const metadata: Metadata = {
  metadataBase: new URL('https://theglare.vercel.app'),
  title: {
    default: "Glare",
    template: "%s | Glare",
  },
  description: "Your essential destination for making sense of today. We provide current affairs news for the modern reader.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png"></link>
        <meta name="theme-color" content="#7c3aed" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2103302400076966"
     crossOrigin="anonymous"></script>
        <meta name="google-site-verification" content="vVS4lyOVugEqlbEBJPkMRGw768T2DkiXThG-X51xKGE" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body text-foreground antialiased",
          workSans.variable,
          spaceGrotesk.variable,
          dancingScript.variable,
          nunito.variable
        )}
      >
        <ProvidersWrapper>
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
              <linearGradient id="instagram-gradient-svg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#feda75' }} />
                <stop offset="50%" style={{ stopColor: '#d62976' }} />
                <stop offset="100%" style={{ stopColor: '#4f5bd5' }} />
              </linearGradient>
            </defs>
          </svg>
          <Script
            strategy="afterInteractive"
            src="https://www.googletagmanager.com/gtag/js?id=G-XV6E6GR0RD"
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-XV6E6GR0RD');
              `,
            }}
          />
          <Toaster />
          <SplashScreen />
          <Suspense fallback={null}>
            <PageLoader />
          </Suspense>
          <div className="relative z-10 flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pt-20">{children}</main>
            <Footer />
          </div>
          <div id="post-actions-container"></div>
        </ProvidersWrapper>
      </body>
    </html>
  );
}

