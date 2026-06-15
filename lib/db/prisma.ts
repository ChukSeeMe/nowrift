import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export async function setRlsContext(userId: string | null, role: string) {
  const dbUserId = userId || '00000000-0000-0000-0000-000000000000';
  const dbRole = role || 'visitor';
  await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${dbUserId}, true)`;
  await prisma.$executeRaw`SELECT set_config('app.current_role', ${dbRole}, true)`;
}

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
