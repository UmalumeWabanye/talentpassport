'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { themes } from './tokens';
import type { ThemeName, ThemeTokens } from './tokens';

type ThemeContextValue = {
  themeName: ThemeName;
  tokens: ThemeTokens;
  setThemeName: (theme: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children, defaultTheme = 'light' }: { children: ReactNode; defaultTheme?: ThemeName }) {
  const [themeName, setThemeName] = useState<ThemeName>(defaultTheme);

  const value = useMemo(
    () => ({
      themeName,
      tokens: themes[themeName],
      setThemeName
    }),
    [themeName],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
