
'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from 'next-themes';
import { DynamicThemeProvider } from '@/contexts/dynamic-theme-context';
import ThoughtOfTheDay from './thought-of-the-day';

export function ClientProviders({ children }: { children: ReactNode }) {

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <DynamicThemeProvider>
        <AuthProvider>
          {children}
          <ThoughtOfTheDay />
        </AuthProvider>
      </DynamicThemeProvider>
    </ThemeProvider>
  );
}
