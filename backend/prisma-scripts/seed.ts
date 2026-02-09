import { Prisma, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Créer utilisateurs
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const managerPassword = await bcrypt.hash('Manager123!', 10);
  const employeePassword = await bcrypt.hash('Employee123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@flexspace.com' },
    update: {},
    create: {
      email: 'admin@flexspace.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@flexspace.com' },
    update: {},
    create: {
      email: 'manager@flexspace.com',
      password: managerPassword,
      firstName: 'Manager',
      lastName: 'Smith',
      role: 'MANAGER',
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: 'employee@flexspace.com' },
    update: {},
    create: {
      email: 'employee@flexspace.com',
      password: employeePassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'EMPLOYEE',
    },
  });

  console.log('✅ Users created:', { admin, manager, employee });

  // Créer espaces
  const spaces: Prisma.SpaceCreateInput[] = [
    {
      name: 'Bureau Open Space 1',
      type: 'DESK',
      capacity: 1,
      floor: '2',
      building: 'A',
      openTime: '08:00',
      closeTime: '20:00',
    },
    {
      name: 'Bureau Open Space 2',
      type: 'DESK',
      capacity: 1,
      floor: '2',
      building: 'A',
      openTime: '08:00',
      closeTime: '20:00',
    },
    {
      name: 'Salle Zeus',
      type: 'MEETING_ROOM',
      capacity: 10,
      floor: '3',
      building: 'B',
      openTime: '08:00',
      closeTime: '20:00',
    },
    {
      name: 'Salle Athena',
      type: 'MEETING_ROOM',
      capacity: 8,
      floor: '3',
      building: 'B',
      openTime: '08:00',
      closeTime: '20:00',
    },
    {
      name: 'Espace Innovation',
      type: 'COLLABORATIVE_SPACE',
      capacity: 6,
      floor: '1',
      building: 'A',
      openTime: '08:00',
      closeTime: '20:00',
    },
    {
      name: 'Espace Créatif',
      type: 'COLLABORATIVE_SPACE',
      capacity: 4,
      floor: '1',
      building: 'C',
      openTime: '08:00',
      closeTime: '18:00',
    },
  ];

  for (const space of spaces) {
    await prisma.space.upsert({
      where: { name: space.name },
      update: {},
      create: space,
    });
  }

  console.log(`✅ ${spaces.length} spaces created`);
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
