import { EmptyState, LayoutShell, NavShell } from '@talent-passport/ui';

const navItems = [
  { key: 'tenants', label: 'Tenants' },
  { key: 'access', label: 'Access Control' },
  { key: 'audit', label: 'Audit' }
];

export default function HomePage() {
  return (
    <LayoutShell title="Admin App Shell" navigation={<NavShell brand="Talent Passport" items={navItems} />}>
      <EmptyState message="Administrative business logic is deferred. This shell exists to validate shared platform primitives only." />
    </LayoutShell>
  );
}
