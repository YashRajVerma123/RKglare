
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Space_Grotesk, Dancing_Script, Work_Sans, Nunito, Libre_Baskerville } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css"; // Corrected import path
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import PageLoader from "@/components/page-loader";
import { Suspense } from "react";
import SplashScreen from "@/components/splash-screen";
import Script from "next/script";
import { ClientProviders } from "@/components/client-providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-dancing-script',
  weight: '700'
});

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
  weight: ['300', '400', '500', '600', '700', '800'], // Including 300 for light
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: '300'
});

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  variable: '--font-libre-baskerville',
  weight: ['400', '700'],
});


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
        <meta name="google-site-verification" content="vVS4lyOVugEqlbEBJPkMRGw768T2DkiXThG-X51xKGE" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body text-foreground antialiased",
          workSans.variable,
          spaceGrotesk.variable,
          dancingScript.variable,
          nunito.variable,
          libreBaskerville.variable
        )}
      >
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
        <ClientProviders>
           <div className="fixed inset-0 -z-10 h-full w-full">
            <div className="bg-ball w-[20vw] h-[20vw] bg-primary/30 dark:bg-primary/20 top-[-5%] left-[-5%]"></div>
            <div className="bg-ball w-[15vw] h-[15vw] bg-secondary/30 dark:bg-secondary/10 bottom-[10%] left-[10%]"></div>
            <div className="bg-ball w-[18vw] h-[18vw] bg-fuchsia-400/40 dark:bg-fuchsia-400/20 top-[15%] right-[5%]"></div>
            <div className="bg-ball w-[22vw] h-[22vw] bg-fuchsia-500/30 dark:bg-fuchsia-500/10 bottom-[-10%] right-[-10%]"></div>
          </div>
          <Toaster />
          <SplashScreen />
          <Suspense fallback={null}>
            <PageLoader />
          </Suspense>
          <div className="relative z-10 flex flex-col min-h-screen page-transition">
            <Header />
            <div className="flex-grow pt-20">
              <main className="w-full">{children}</main>
              <Footer />
            </div>
          </div>
          <div id="post-actions-container"></div>
        </ClientProviders>
      </body>
    </html>
  );
}
