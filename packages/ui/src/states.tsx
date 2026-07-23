'use client';

import { useTheme } from './theme-provider';
import { spacing, typography } from './tokens';

function BaseCard({ title, description, tone = 'default' }: { title: string; description: string; tone?: 'default' | 'danger' }) {
  const { tokens } = useTheme();

  return (
    <section
      aria-live="polite"
      style={{
        border: `1px solid ${tone === 'danger' ? tokens.danger : tokens.border}`,
        background: tokens.surface,
        borderRadius: 12,
        padding: spacing.xl,
        maxWidth: 640
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: spacing.sm, fontSize: typography.scale.xl }}>{title}</h2>
      <p style={{ margin: 0, color: tokens.mutedText }}>{description}</p>
    </section>
  );
}

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return <BaseCard title="Loading" description={label} />;
}

export function ErrorState({ message }: { message: string }) {
  return <BaseCard title="Something went wrong" description={message} tone="danger" />;
}

export function EmptyState({ message }: { message: string }) {
  return <BaseCard title="Nothing here yet" description={message} />;
}
