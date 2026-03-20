import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: 'admin' },
        { email: 'admin' }
      ]
    },
    include: { role: true }
  });
  console.log('User found:', JSON.stringify(user, null, 2));
}

check().finally(() => prisma.$disconnect());
