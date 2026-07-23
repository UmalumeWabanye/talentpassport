import { EmptyState, LayoutShell, NavShell } from '@talent-passport/ui';

const navItems = [
  { key: 'overview', label: 'Overview' },
  { key: 'settings', label: 'Settings' },
  { key: 'audit', label: 'Audit Log' }
];

export default function HomePage() {
  return (
    <LayoutShell title="Youth App Shell" navigation={<NavShell brand="Talent Passport" items={navItems} />}>
      <EmptyState message="Foundation shell is ready. Business features are intentionally out of scope in Phase 01." />
    </LayoutShell>
  );
}
