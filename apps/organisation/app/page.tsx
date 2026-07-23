import { EmptyState, LayoutShell, NavShell } from '@talent-passport/ui';

const navItems = [
  { key: 'programs', label: 'Programs' },
  { key: 'members', label: 'Members' },
  { key: 'compliance', label: 'Compliance' }
];

export default function HomePage() {
  return (
    <LayoutShell title="Organisation App Shell" navigation={<NavShell brand="Talent Passport" items={navItems} />}>
      <EmptyState message="Organisation workflows are deferred. Phase 01 delivers only the shared shell foundation." />
    </LayoutShell>
  );
}
