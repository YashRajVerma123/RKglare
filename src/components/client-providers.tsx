
'use client';

import { ReactNode, Suspense } from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from 'next-themes';
import { DynamicThemeProvider } from '@/contexts/dynamic-theme-context';
import DailyLoginReward from './daily-login-reward';
<<<<<<< HEAD
import { MusicPlayerProvider } from '@/contexts/music-player-context';
import MusicPlayer from './music-player';
=======
import PageLoader from './page-loader';
>>>>>>> 1531906a49df14b9e1344220031277afad7a8f21

export function ClientProviders({ children }: { children: ReactNode }) {

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <DynamicThemeProvider>
        <AuthProvider>
<<<<<<< HEAD
          <MusicPlayerProvider>
            {children}
            <DailyLoginReward />
            <MusicPlayer />
          </MusicPlayerProvider>
=======
          <Suspense fallback={null}>
            <PageLoader />
          </Suspense>
          {children}
          <DailyLoginReward />
>>>>>>> 1531906a49df14b9e1344220031277afad7a8f21
        </AuthProvider>
      </DynamicThemeProvider>
    </ThemeProvider>
  );
}
