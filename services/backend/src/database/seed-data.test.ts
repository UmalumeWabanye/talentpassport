import { describe, expect, it } from 'vitest';

import { buildSeedData, getSeedMembershipSpecs } from '../../../../database/prisma/seed-data.mjs';

describe('seed data', () => {
  it('builds a deterministic core seed set', () => {
    const seedData = buildSeedData({
      adminEmail: 'admin@talentpassport.local',
      organizationName: 'Talent Passport Core',
      organizationSlug: 'talent-passport-core',
      userEmail: 'seed-user@talentpassport.local'
    });

    expect(seedData.permissions).toHaveLength(7);
    expect(seedData.roles.map((role: { key: string }) => role.key)).toEqual(['user', 'admin']);
    expect(seedData.organization.slug).toBe('talent-passport-core');
    expect(seedData.adminEmail).toBe('admin@talentpassport.local');
    expect(seedData.userEmail).toBe('seed-user@talentpassport.local');
    expect(getSeedMembershipSpecs(seedData)).toHaveLength(2);
  });

  it('remains stable for the same inputs', () => {
    const first = buildSeedData({ adminEmail: 'admin@talentpassport.local' });
    const second = buildSeedData({ adminEmail: 'admin@talentpassport.local' });

    expect(first).toEqual(second);
  });
});
