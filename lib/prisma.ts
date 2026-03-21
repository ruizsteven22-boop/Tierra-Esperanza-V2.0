import { PrismaClient } from '@prisma/client';

console.log('--- Depuración de Base de Datos ---');
console.log('DATABASE_URL está definida:', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL comienza con mysql://:', process.env.DATABASE_URL.startsWith('mysql://'));
  console.log('Longitud de DATABASE_URL:', process.env.DATABASE_URL.length);
} else {
  console.log('DATABASE_URL no está definida en process.env');
}
console.log('-----------------------------------');

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
