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
      password: 'Worldmos300622',
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
  // Admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@devbuplaytime.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@devbuplaytime.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      profile: {
        create: {
          displayName: 'Admin',
          bio: 'Administrador de DevbuPlaytime',
          xp: 9999,
          level: 99,
          coins: 9999
        }
      }
    }
  });

  // Demo user
  const userPassword = await bcrypt.hash('User123!', 12);
  await prisma.user.upsert({
    where: { email: 'demo@devbuplaytime.com' },
    update: {},
    create: {
      username: 'devbu93',
      email: 'demo@devbuplaytime.com',
      passwordHash: userPassword,
      profile: {
        create: {
          displayName: 'DEVBU93',
          bio: 'El fundador de DevbuPlaytime'
        }
      }
    }
  });

  // World 1: Matematicas
  const world1 = await prisma.world.upsert({
    where: { slug: 'matematicas' },
    update: {},
    create: {
      name: 'Reino de las Matematicas',
      description: 'Domina los numeros y conviertete en el maestro del calculo',
      slug: 'matematicas',
      order: 1,
      imageUrl: '/worlds/math.png',
      chapters: {
        create: [
          {
            name: 'Aritmetica Basica',
            description: 'Suma, resta, multiplicacion y division',
            order: 1,
            missions: {
              create: [
                {
                  name: 'Suma de Heroes',
                  description: 'Aprende a sumar con los heroes de la manada',
                  order: 1,
                  xpReward: 100,
                  coinReward: 10,
                  timeLimit: 120,
                  questions: {
                    create: [
                      { text: 'Cuanto es 5 + 3?', type: 'MULTIPLE_CHOICE', options: ['6', '7', '8', '9'], correctAnswer: '8', points: 10 },
                      { text: 'Cuanto es 12 + 7?', type: 'MULTIPLE_CHOICE', options: ['17', '18', '19', '20'], correctAnswer: '19', points: 10 },
                      { text: 'Cuanto es 15 + 15?', type: 'MULTIPLE_CHOICE', options: ['28', '29', '30', '31'], correctAnswer: '30', points: 15 }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  });

  console.log('World created:', world1.id);

  // Cosmetics
  await prisma.cosmetic.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Avatar Dragon', type: 'AVATAR', rarity: 'RARE', price: 500, imageUrl: '/cosmetics/dragon.png' },
      { name: 'Marco Legendario', type: 'BORDER', rarity: 'LEGENDARY', price: 1000, imageUrl: '/cosmetics/border-legendary.png' },
      { name: 'Titulo Maestro', type: 'TITLE', rarity: 'EPIC', price: 750 }
    ]
  });

  // Achievements
  await prisma.achievement.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Primer Paso', description: 'Completa tu primera mision', icon: 'target', condition: { type: 'missions_completed', count: 1 }, xpReward: 50 },
      { name: 'Estudioso', description: 'Completa 10 misiones', icon: 'book', condition: { type: 'missions_completed', count: 10 }, xpReward: 200 },
      { name: 'Campeon de Arena', description: 'Gana 5 partidas de arena', icon: 'sword', condition: { type: 'arena_wins', count: 5 }, xpReward: 300 }
    ]
  });

  console.log('Seed completado!');
  console.log('Admin: admin@devbuplaytime.com / Admin123!');
  console.log('Demo: demo@devbuplaytime.com / User123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
