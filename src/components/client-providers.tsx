
'use client';

import { ReactNode, Suspense } from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from 'next-themes';
import { DynamicThemeProvider } from '@/contexts/dynamic-theme-context';
import DailyLoginReward from './daily-login-reward';
import PageLoader from './page-loader';

export function ClientProviders({ children }: { children: ReactNode }) {

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <DynamicThemeProvider>
        <AuthProvider>
          <Suspense fallback={null}>
            <PageLoader />
          </Suspense>
          {children}
          <DailyLoginReward />
        </AuthProvider>
      </DynamicThemeProvider>
    </ThemeProvider>
  );
}
