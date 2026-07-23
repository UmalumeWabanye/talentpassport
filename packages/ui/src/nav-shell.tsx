'use client';

import type { ReactNode } from 'react';

import { useTheme } from './theme-provider';
import { spacing, typography } from './tokens';

export type NavItem = {
  key: string;
  label: string;
  icon?: ReactNode;
};

export function NavShell({ brand, items }: { brand: string; items: NavItem[] }) {
  const { tokens } = useTheme();

  return (
    <nav aria-label="Primary navigation">
      <div style={{ fontWeight: typography.headingWeight, marginBottom: spacing.xl }}>{brand}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: spacing.sm }}>
        {items.map((item) => (
          <li
            key={item.key}
            style={{
              border: `1px solid ${tokens.border}`,
              borderRadius: 10,
              background: tokens.accentSoft,
              padding: `${spacing.sm}px ${spacing.md}px`
            }}
          >
            <button
              type="button"
              style={{
                appearance: 'none',
                width: '100%',
                textAlign: 'left',
                border: 'none',
                background: 'transparent',
                color: tokens.text,
                fontSize: typography.scale.sm,
                cursor: 'pointer',
                padding: 0
              }}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
