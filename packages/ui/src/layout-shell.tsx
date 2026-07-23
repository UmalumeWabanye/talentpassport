'use client';

import type { ReactNode } from 'react';

import { useTheme } from './theme-provider';
import { spacing, typography } from './tokens';

export function LayoutShell({ title, navigation, children }: { title: string; navigation: ReactNode; children: ReactNode }) {
  const { tokens } = useTheme();

  return (
    <>
      <style>{`
        .tp-shell {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 280px 1fr;
        }

        .tp-shell__sidebar {
          border-right: 1px solid ${tokens.border};
          padding: ${spacing.xl}px;
        }

        .tp-shell__main {
          padding: ${spacing.xxl}px;
        }

        @media (max-width: 900px) {
          .tp-shell {
            grid-template-columns: 1fr;
          }

          .tp-shell__sidebar {
            border-right: none;
            border-bottom: 1px solid ${tokens.border};
          }

          .tp-shell__main {
            padding: ${spacing.xl}px;
          }
        }
      `}</style>
      <div
        className="tp-shell"
        style={{
          background: tokens.background,
          color: tokens.text,
          fontFamily: typography.fontFamily
        }}
      >
        <aside
          className="tp-shell__sidebar"
          style={{
            background: tokens.surface
          }}
        >
          {navigation}
        </aside>
        <main className="tp-shell__main">
          <h1 style={{ marginTop: 0, fontSize: typography.scale.xxl, fontWeight: typography.headingWeight }}>
            {title}
          </h1>
          {children}
        </main>
      </div>
    </>
  );
}
