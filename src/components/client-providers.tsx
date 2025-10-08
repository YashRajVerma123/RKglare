
'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from 'next-themes';
import { DynamicThemeProvider } from '@/contexts/dynamic-theme-context';
import DailyLoginReward from './daily-login-reward';
import { MusicPlayerProvider } from '@/contexts/music-player-context';
import MusicPlayer from './music-player';

export function ClientProviders({ children }: { children: ReactNode }) {

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <DynamicThemeProvider>
        <AuthProvider>
          <MusicPlayerProvider>
            {children}
            <DailyLoginReward />
            <MusicPlayer />
          </MusicPlayerProvider>
        </AuthProvider>
      </DynamicThemeProvider>
    </ThemeProvider>
  );
}
