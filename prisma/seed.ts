import 'dotenv/config';
import { PrismaClient, LeadStage } from '@prisma/client';

const prisma = new PrismaClient();

const names = ['Ava Martin', 'Liam Chen', 'Noah Patel', 'Mia Rossi', 'Ethan Brooks', 'Zoe Kim', 'Lucas Silva', 'Isla Novak'];
const companies = ['Brightwave', 'Altura Health', 'Kestrel Logistics', 'Northstar Bank', 'Fabrik Works', 'Cloudline'];
const sizes = ['Team size: 1–10', 'Team size: 11–50', 'Team size: 51–200', 'Team size: 200+'];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomStage(): LeadStage {
  const r = Math.random();
  if (r < 0.35) return 'NEW';
  if (r < 0.62) return 'QUALIFIED';
  if (r < 0.82) return 'NEGOTIATION';
  if (r < 0.94) return 'WON';
  return 'LOST';
}

async function main() {
  // only removes earlier demo leads, never real ones
  await prisma.lead.deleteMany({ where: { email: { endsWith: '@example.com' } } });

  const now = Date.now();
  const data = Array.from({ length: 40 }, (_, i) => ({
    name: pick(names),
    email: `demo${i + 1}@example.com`,
    company: pick(companies),
    teamSize: pick(sizes),
    message: 'Demo lead',
    stage: randomStage(),
    createdAt: new Date(now - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
  }));

  await prisma.lead.createMany({ data });
  console.log(`Seeded ${data.length} demo leads`);
}

main().finally(() => prisma.$disconnect());