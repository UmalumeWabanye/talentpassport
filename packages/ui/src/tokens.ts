export const typography = {
  fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
  headingWeight: 700,
  bodyWeight: 400,
  scale: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.5rem',
    xxl: '2rem'
  }
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
} as const;

export const themes = {
  light: {
    background: '#f4f6f8',
    surface: '#ffffff',
    text: '#0f172a',
    mutedText: '#475569',
    border: '#cbd5e1',
    accent: '#0f766e',
    accentSoft: '#ccfbf1',
    danger: '#b91c1c'
  },
  dark: {
    background: '#0b1220',
    surface: '#111827',
    text: '#e2e8f0',
    mutedText: '#94a3b8',
    border: '#334155',
    accent: '#14b8a6',
    accentSoft: '#134e4a',
    danger: '#f87171'
  }
} as const;

export type ThemeName = keyof typeof themes;
export type ThemeTokens = (typeof themes)[ThemeName];
