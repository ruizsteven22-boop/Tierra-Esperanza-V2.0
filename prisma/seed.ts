import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- SEEDING DATABASE ---');

  // 1. Roles
  const roles = [
    { name: 'superadmin', description: 'Acceso total al sistema' },
    { name: 'administrador', description: 'Gestión administrativa casi total' },
    { name: 'secretaria', description: 'Gestión de socios y documentos' },
    { name: 'tesoreria', description: 'Gestión financiera y recibos' },
    { name: 'directiva', description: 'Gestión de asambleas y directiva' },
    { name: 'consulta', description: 'Solo lectura general' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  console.log('✓ Roles created');

  // 2. Superadmin User
  const superadminRole = await prisma.role.findUnique({ where: { name: 'superadmin' } });
  if (!superadminRole) throw new Error('Superadmin role not found');

  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      name: 'Super Administrador',
      username: 'admin',
      email: 'admin@sigevivi.cl',
      passwordHash,
      roleId: superadminRole.id,
      isActive: true,
    },
  });
  console.log('✓ Superadmin user created (admin / admin123)');

  // 3. Initial Config
  await prisma.systemConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      committeeName: 'Comité SIGEVIVI',
      address: 'Dirección del Comité',
      phone: '+56 9 1234 5678',
      email: 'contacto@sigevivi.cl',
      region: 'Metropolitana',
      commune: 'Santiago',
      representativeName: 'Representante Legal',
    },
  });
  console.log('✓ Initial system config created');

  console.log('--- SEEDING COMPLETED ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
