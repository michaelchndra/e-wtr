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
    where: { email: 'admin@e-wtr.lunemich.dev' },
    update: {},
    create: { email: 'admin@e-wtr.lunemich.dev', password: passwordHash, name: 'Administrator', role: 'admin' },
  });

  const qc = await prisma.user.upsert({
    where: { email: 'qc@e-wtr.lunemich.dev' },
    update: {},
    create: { email: 'qc@e-wtr.lunemich.dev', password: passwordHash, name: 'QC Inspector', role: 'qc' },
  });

  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@e-wtr.lunemich.dev' },
    update: {},
    create: { email: 'supervisor@e-wtr.lunemich.dev', password: passwordHash, name: 'QC Supervisor', role: 'supervisor' },
  });

  const dc = await prisma.user.upsert({
    where: { email: 'dc@e-wtr.lunemich.dev' },
    update: {},
    create: { email: 'dc@e-wtr.lunemich.dev', password: passwordHash, name: 'Document Control', role: 'document_control' },
  });

  const client = await prisma.user.upsert({
    where: { email: 'client@e-wtr.lunemich.dev' },
    update: {},
    create: { email: 'client@e-wtr.lunemich.dev', password: passwordHash, name: 'Client Rep', role: 'client' },
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
