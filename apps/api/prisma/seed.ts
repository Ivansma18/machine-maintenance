import 'dotenv/config';

import { randomBytes, scrypt } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to run the seed');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const permissionDefinitions = [
  { key: 'dashboard:read', description: 'View the operational dashboard.' },
  { key: 'machines:read', description: 'View and filter machines.' },
  { key: 'machines:create', description: 'Create machines.' },
  { key: 'machines:update', description: 'Update machine data.' },
  { key: 'machines:retire', description: 'Retire or deactivate machines.' },
  { key: 'maintenance-plans:read', description: 'View maintenance plans.' },
  { key: 'maintenance-plans:create', description: 'Create maintenance plans.' },
  { key: 'maintenance-plans:update', description: 'Update maintenance plans.' },
  { key: 'maintenance-plans:activate', description: 'Activate maintenance plans.' },
  { key: 'maintenance-plans:deactivate', description: 'Deactivate maintenance plans.' },
  { key: 'maintenance-logs:read', description: 'View maintenance history.' },
  { key: 'maintenance-logs:create', description: 'Create maintenance logs.' },
  { key: 'notifications:read', description: 'View notifications.' },
  { key: 'notifications:acknowledge', description: 'Acknowledge notifications.' },
  { key: 'notifications:resolve', description: 'Resolve notifications.' },
  { key: 'notifications:dismiss', description: 'Dismiss notifications.' },
  {
    key: 'notifications:process-preventive',
    description: 'Run preventive notification processing.',
  },
  { key: 'work-orders:read', description: 'View work orders.' },
  { key: 'work-orders:create', description: 'Create work orders.' },
  { key: 'work-orders:update', description: 'Update work orders.' },
  { key: 'work-orders:assign', description: 'Assign work orders.' },
  { key: 'work-orders:start', description: 'Start work orders.' },
  { key: 'work-orders:complete', description: 'Complete work orders.' },
  { key: 'work-orders:cancel', description: 'Cancel work orders.' },
] as const;

const roleDefinitions = [
  {
    name: 'Admin',
    description: 'Global configuration and complete operational access.',
    permissions: permissionDefinitions.map(({ key }) => key),
  },
  {
    name: 'Maintenance Manager',
    description: 'Manage operational assets, plans, history, and alerts.',
    permissions: [
      'dashboard:read',
      'machines:read',
      'machines:create',
      'machines:update',
      'machines:retire',
      'maintenance-plans:read',
      'maintenance-plans:create',
      'maintenance-plans:update',
      'maintenance-plans:activate',
      'maintenance-plans:deactivate',
      'maintenance-logs:read',
      'maintenance-logs:create',
      'notifications:read',
      'notifications:acknowledge',
      'notifications:resolve',
      'notifications:dismiss',
      'notifications:process-preventive',
      'work-orders:read',
      'work-orders:create',
      'work-orders:update',
      'work-orders:assign',
      'work-orders:start',
      'work-orders:complete',
      'work-orders:cancel',
    ],
  },
  {
    name: 'Technician',
    description: 'Execute and document technical maintenance work.',
    permissions: [
      'dashboard:read',
      'machines:read',
      'maintenance-plans:read',
      'maintenance-logs:read',
      'maintenance-logs:create',
      'notifications:read',
      'notifications:acknowledge',
      'notifications:resolve',
      'work-orders:read',
      'work-orders:start',
      'work-orders:complete',
    ],
  },
  {
    name: 'Viewer',
    description: 'View operational information without write access.',
    permissions: [
      'dashboard:read',
      'machines:read',
      'maintenance-plans:read',
      'maintenance-logs:read',
      'notifications:read',
      'work-orders:read',
    ],
  },
] as const;

const categories = [
  { name: 'Oven', description: 'Industrial and bakery ovens.' },
  { name: 'Mixer', description: 'Mixers for bakery ingredients and dough.' },
  { name: 'DoughKneader', description: 'Machines dedicated to dough kneading.' },
];

function requiredEnvironment(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required to run the seed`);
  }

  return value;
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password,
      salt,
      64,
      {
        N: 16_384,
        r: 8,
        p: 1,
        maxmem: 32 * 1024 * 1024,
      },
      (error, key) => {
        if (error) reject(error);
        else resolve(key);
      },
    );
  });

  return `scrypt$16384$8$1$${salt}$${derivedKey.toString('hex')}`;
}

async function main() {
  const adminUsername = requiredEnvironment('ADMIN_USERNAME').toLowerCase();
  const adminEmail = requiredEnvironment('ADMIN_EMAIL').toLowerCase();
  const adminName = requiredEnvironment('ADMIN_NAME');
  const adminPassword = requiredEnvironment('ADMIN_PASSWORD');

  for (const category of categories) {
    await prisma.machineCategory.upsert({
      where: { name: category.name },
      update: { description: category.description },
      create: category,
    });
  }

  const permissions = new Map<string, { id: string }>();

  for (const permission of permissionDefinitions) {
    const record = await prisma.permission.upsert({
      where: { key: permission.key },
      update: { description: permission.description },
      create: permission,
      select: { id: true },
    });

    permissions.set(permission.key, record);
  }

  const roles = new Map<string, { id: string }>();

  for (const role of roleDefinitions) {
    const record = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: { name: role.name, description: role.description },
      select: { id: true },
    });

    roles.set(role.name, record);

    for (const permissionKey of role.permissions) {
      const permission = permissions.get(permissionKey);

      if (!permission) {
        throw new Error(`Permission ${permissionKey} is not defined`);
      }

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: record.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: record.id,
          permissionId: permission.id,
        },
      });
    }
  }

  const passwordHash = await hashPassword(adminPassword);
  const admin = await prisma.user.upsert({
    where: { username: adminUsername },
    update: {
      email: adminEmail,
      name: adminName,
      isActive: true,
    },
    create: {
      username: adminUsername,
      email: adminEmail,
      name: adminName,
      passwordHash,
      isActive: true,
    },
    select: { id: true },
  });

  const adminRole = roles.get('Admin');

  if (!adminRole) {
    throw new Error('Admin role was not seeded');
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: adminRole.id,
    },
  });

  console.log(
    `Seeded ${categories.length} machine categories, ${permissionDefinitions.length} permissions, ${roleDefinitions.length} roles, and the admin user.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
