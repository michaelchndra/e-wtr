import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL environment variable is missing');

console.log('Connecting to:', connectionString ? 'Found URL' : 'URL MISSING');

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@epcc.com' },
    update: {},
    create: { email: 'admin@epcc.com', password: passwordHash, name: 'Administrator', role: 'admin' },
  });

  const qc = await prisma.user.upsert({
    where: { email: 'qc@epcc.com' },
    update: {},
    create: { email: 'qc@epcc.com', password: passwordHash, name: 'QC Inspector', role: 'qc' },
  });

  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@epcc.com' },
    update: {},
    create: { email: 'supervisor@epcc.com', password: passwordHash, name: 'QC Supervisor', role: 'supervisor' },
  });

  const dc = await prisma.user.upsert({
    where: { email: 'dc@epcc.com' },
    update: {},
    create: { email: 'dc@epcc.com', password: passwordHash, name: 'Document Control', role: 'document_control' },
  });

  const client = await prisma.user.upsert({
    where: { email: 'client@epcc.com' },
    update: {},
    create: { email: 'client@epcc.com', password: passwordHash, name: 'Client Rep', role: 'client' },
  });

  console.log('Seed: Default accounts created:');
  console.log(`- ${admin.email}`);
  console.log(`- ${qc.email}`);
  console.log(`- ${supervisor.email}`);
  console.log(`- ${dc.email}`);
  console.log(`- ${client.email}`);

  const proj1 = await prisma.project.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'Offshore Platform Alpha', client_name: 'PT Pertamina Hulu Energi', location: 'Java Sea' }
  });

  const proj2 = await prisma.project.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: 'Refinery Expansion Phase 2', client_name: 'PT Kilang Pertamina', location: 'Balikpapan' }
  });

  console.log('Seed: Default projects created.');

  await prisma.wTR.updateMany({
    where: { project_id: null },
    data: { project_id: 1 }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
