const DEFAULT_PERMISSIONS = [
  {
    description: 'Read authenticated account and session information',
    key: 'auth:read',
    name: 'Read Auth'
  },
  {
    description: 'Manage authentication sessions and accounts',
    key: 'auth:manage',
    name: 'Manage Auth'
  },
  {
    description: 'Read admin-only operational data',
    key: 'admin:read',
    name: 'Read Admin'
  },
  {
    description: 'Read tenant-scoped data',
    key: 'tenant:read',
    name: 'Read Tenant'
  },
  {
    description: 'Manage tenant-scoped data',
    key: 'tenant:manage',
    name: 'Manage Tenant'
  },
  {
    description: 'Read organization data',
    key: 'org:read',
    name: 'Read Organization'
  },
  {
    description: 'Manage organization data',
    key: 'org:write',
    name: 'Manage Organization'
  }
];

const DEFAULT_ROLES = [
  {
    description: 'Standard authenticated user',
    key: 'user',
    name: 'User'
  },
  {
    description: 'Platform administrator',
    key: 'admin',
    name: 'Admin'
  }
];

const DEFAULT_ORGANIZATION = {
  description: 'Seed organization for local and test environments',
  name: 'Talent Passport Core',
  slug: 'talent-passport-core'
};

const DEFAULT_USER_EMAIL = 'seed-user@talentpassport.local';
const DEFAULT_ADMIN_EMAIL = 'admin@talentpassport.local';

export function buildSeedData(input = {}) {
  const adminEmail = input.adminEmail ?? DEFAULT_ADMIN_EMAIL;
  const userEmail = input.userEmail ?? DEFAULT_USER_EMAIL;
  const organization = {
    description: input.organizationDescription ?? DEFAULT_ORGANIZATION.description,
    name: input.organizationName ?? DEFAULT_ORGANIZATION.name,
    slug: input.organizationSlug ?? DEFAULT_ORGANIZATION.slug
  };

  return {
    adminEmail,
    organization,
    permissions: DEFAULT_PERMISSIONS,
    roles: DEFAULT_ROLES,
    userEmail
  };
}

export function getSeedMembershipSpecs(seedData) {
  return [
    {
      organizationSlug: seedData.organization.slug,
      permissionKeys: ['auth:read', 'tenant:read'],
      roleKey: 'user',
      userEmail: seedData.userEmail
    },
    {
      organizationSlug: seedData.organization.slug,
      permissionKeys: ['auth:read', 'auth:manage', 'admin:read', 'tenant:read', 'tenant:manage', 'org:read', 'org:write'],
      roleKey: 'admin',
      userEmail: seedData.adminEmail
    }
  ];
}
