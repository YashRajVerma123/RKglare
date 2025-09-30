
'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from 'next-themes';
import { DynamicThemeProvider } from '@/contexts/dynamic-theme-context';
import DailyLoginReward from './daily-login-reward';

export function ClientProviders({ children }: { children: ReactNode }) {

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <DynamicThemeProvider>
        <AuthProvider>
          {children}
          <DailyLoginReward />
        </AuthProvider>
      </DynamicThemeProvider>
    </ThemeProvider>
  );
}
