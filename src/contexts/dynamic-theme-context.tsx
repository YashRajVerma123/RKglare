
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { themes, getThemeByTagName, Theme } from '@/lib/themes';

interface DynamicThemeContextType {
  setTheme: (tagName: string) => void;
  resetTheme: () => void;
}

const DynamicThemeContext = createContext<DynamicThemeContextType | undefined>(undefined);

export const DynamicThemeProvider = ({ children }: { children: ReactNode }) => {
  const { theme: mode } = useNextTheme(); // 'light' or 'dark'

  const applyTheme = (theme: Theme | undefined) => {
    if (!theme || !mode) return;
    
    const root = document.documentElement;
    const themeColors = theme.colors[mode as keyof typeof theme.colors];

    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  };

  const setTheme = (tagName: string) => {
    const newTheme = getThemeByTagName(tagName);
    applyTheme(newTheme);
  };

  const resetTheme = () => {
    const defaultTheme = themes.find(t => t.name === 'default');
    applyTheme(defaultTheme);
  };
  
  // Re-apply theme when light/dark mode changes
  useEffect(() => {
    // This is tricky because we don't know the "current" tag theme.
    // For now, let's just reset to default on mode change.
    // A more advanced implementation might store the current tag in context.
    resetTheme();
  }, [mode]);

  return (
    <DynamicThemeContext.Provider value={{ setTheme, resetTheme }}>
      {children}
    </DynamicThemeContext.Provider>
  );
};

export const useDynamicTheme = () => {
  const context = useContext(DynamicThemeContext);
  if (context === undefined) {
    throw new Error('useDynamicTheme must be used within a DynamicThemeProvider');
  }
  return context;
};
