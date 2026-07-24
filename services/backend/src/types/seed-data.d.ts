declare module '../../../../database/prisma/seed-data.mjs' {
  export type SeedData = {
    adminEmail: string;
    organization: {
      description: string;
      name: string;
      slug: string;
    };
    permissions: Array<{
      description: string;
      key: string;
      name: string;
    }>;
    roles: Array<{
      description: string;
      key: string;
      name: string;
    }>;
    userEmail: string;
  };

  export function buildSeedData(input?: {
    adminEmail?: string;
    organizationDescription?: string;
    organizationName?: string;
    organizationSlug?: string;
    userEmail?: string;
  }): SeedData;

  export function getSeedMembershipSpecs(seedData: SeedData): Array<{
    organizationSlug: string;
    permissionKeys: string[];
    roleKey: string;
    userEmail: string;
  }>;
}
