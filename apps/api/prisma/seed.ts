import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to run the seed');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const categories = [
  { name: 'Oven', description: 'Industrial and bakery ovens.' },
  { name: 'Mixer', description: 'Mixers for bakery ingredients and dough.' },
  { name: 'DoughKneader', description: 'Machines dedicated to dough kneading.' },
];

async function main() {
  for (const category of categories) {
    await prisma.machineCategory.upsert({
      where: { name: category.name },
      update: { description: category.description },
      create: category,
    });
  }

  console.log(`Seeded ${categories.length} machine categories.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
