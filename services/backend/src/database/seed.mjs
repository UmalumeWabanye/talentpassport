import { config } from 'dotenv';
import process from 'node:process';
import { URL } from 'node:url';

import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { PrismaClient } from '../../generated/prisma/client.js';
import { buildSeedData, getSeedMembershipSpecs } from '../../../../database/prisma/seed-data.mjs';

config({ path: new URL('../../../../.env', import.meta.url) });

function resolveDatabaseUrl() {
  return process.env.DATABASE_URL_POOLED || process.env.DIRECT_URL || process.env.DATABASE_URL;
}

async function main() {
  const databaseUrl = resolveDatabaseUrl();

  if (!databaseUrl) {
    throw new Error('DATABASE_URL, DATABASE_URL_POOLED, or DIRECT_URL is required for seeding');
  }

  const seedData = buildSeedData({
    adminEmail: (process.env.AUTH_ADMIN_EMAILS ?? '').split(',')[0]?.trim() || undefined
  });

  const pool = new Pool({ connectionString: databaseUrl });
  const client = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    for (const permission of seedData.permissions) {
      await client.permission.upsert({
        create: permission,
        update: {
          description: permission.description,
          name: permission.name
        },
        where: { key: permission.key }
      });
    }

    for (const role of seedData.roles) {
      await client.role.upsert({
        create: role,
        update: {
          description: role.description,
          name: role.name
        },
        where: { key: role.key }
      });
    }

    const adminRole = await client.role.findUniqueOrThrow({ where: { key: 'admin' } });
    const userRole = await client.role.findUniqueOrThrow({ where: { key: 'user' } });
    const organization = await client.organization.upsert({
      create: {
        description: seedData.organization.description,
        name: seedData.organization.name,
        slug: seedData.organization.slug
      },
      update: {
        description: seedData.organization.description,
        name: seedData.organization.name
      },
      where: { slug: seedData.organization.slug }
    });

    const adminUser = await client.user.upsert({
      create: {
        email: seedData.adminEmail,
        displayName: 'Platform Admin',
        isActive: true,
        passwordHash: null
      },
      update: {
        displayName: 'Platform Admin',
        isActive: true
      },
      where: { email: seedData.adminEmail }
    });

    const seedUser = await client.user.upsert({
      create: {
        email: seedData.userEmail,
        displayName: 'Seed User',
        isActive: true,
        passwordHash: null
      },
      update: {
        displayName: 'Seed User',
        isActive: true
      },
      where: { email: seedData.userEmail }
    });

    const roleMap = new Map([
      ['admin', adminRole.id],
      ['user', userRole.id]
    ]);

    const permissionMap = new Map(
      await Promise.all(
        seedData.permissions.map(async (permission) => {
          const record = await client.permission.findUniqueOrThrow({ where: { key: permission.key } });
          return [permission.key, record.id];
        }),
      ),
    );

    await client.rolePermission.deleteMany({
      where: {
        roleId: { in: Array.from(roleMap.values()) }
      }
    });

    const rolePermissionPairs = [
      ['user', ['auth:read', 'tenant:read']],
      ['admin', ['auth:read', 'auth:manage', 'admin:read', 'tenant:read', 'tenant:manage', 'org:read', 'org:write']]
    ];

    await client.rolePermission.createMany({
      data: rolePermissionPairs.flatMap(([roleKey, permissionKeys]) => {
        const roleId = roleMap.get(roleKey);

        if (!roleId) {
          return [];
        }

        return permissionKeys.map((permissionKey) => {
          const permissionId = permissionMap.get(permissionKey);

          if (!permissionId) {
            throw new Error(`Missing permission seed for ${permissionKey}`);
          }

          return { permissionId, roleId };
        });
      })
    });

    const memberships = getSeedMembershipSpecs(seedData);

    for (const membership of memberships) {
      const user = membership.userEmail === seedData.adminEmail ? adminUser : seedUser;
      const roleId = roleMap.get(membership.roleKey);

      if (!roleId) {
        throw new Error(`Missing role seed for ${membership.roleKey}`);
      }

      await client.membership.upsert({
        create: {
          organizationId: organization.id,
          roleId,
          status: 'active',
          userId: user.id
        },
        update: {
          organizationId: organization.id,
          roleId,
          status: 'active'
        },
        where: {
          userId_organizationId: {
            organizationId: organization.id,
            userId: user.id
          }
        }
      });
    }

    process.stdout.write(
      `Seeded ${seedData.permissions.length} permissions, ${seedData.roles.length} roles, 1 organization, and ${memberships.length} memberships.\n`,
    );
  } finally {
    await client.$disconnect();
    await pool.end();
  }
}

void main().catch((error) => {
  process.stderr.write(`${String(error)}\n`);
  process.exitCode = 1;
});
