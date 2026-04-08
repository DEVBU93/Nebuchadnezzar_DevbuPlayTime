import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = 'Admin123!';
  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email: 'rubenrodriguez.f.93@gmail.com' },
    update: {
      role: 'ORQUESTADOR',
      isActive: true
    },
    create: {
      id: 'orquestador-001',
      username: 'rubenrodriguez',
      email: 'rubenrodriguez.f.93@gmail.com',
      password: hashedPassword,
      role: 'ORQUESTADOR',
      isActive: true
    }
  });

  console.log('✅ Usuario ORQUESTADOR creado:', {
    email: 'rubenrodriguez.f.93@gmail.com',
    password,
    role: 'ORQUESTADOR'
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
