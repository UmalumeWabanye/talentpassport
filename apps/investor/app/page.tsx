import { EmptyState, LayoutShell, NavShell } from '@talent-passport/ui';

const navItems = [
  { key: 'overview', label: 'Overview' },
  { key: 'funding', label: 'Funding Signals' },
  { key: 'reports', label: 'Reports' }
];

export default function HomePage() {
  return (
    <LayoutShell title="Investor App Shell" navigation={<NavShell brand="Talent Passport" items={navItems} />}>
      <EmptyState message="Investor-facing analytics are intentionally deferred beyond Phase 01." />
    </LayoutShell>
  );
}
