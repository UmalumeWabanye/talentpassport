import { EmptyState, LayoutShell, NavShell } from '@talent-passport/ui';

const navItems = [
  { key: 'roles', label: 'Open Roles' },
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'settings', label: 'Settings' }
];

export default function HomePage() {
  return (
    <LayoutShell title="Employer App Shell" navigation={<NavShell brand="Talent Passport" items={navItems} />}>
      <EmptyState message="Employer capabilities remain out of scope until a later phase PRD is approved." />
    </LayoutShell>
  );
}
