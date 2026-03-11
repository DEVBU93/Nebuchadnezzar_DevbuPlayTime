import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@devbuplaytime.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@devbuplaytime.com',
      passwordHash: adminPassword,
      displayName: 'Admin',
      role: 'ADMIN',
      profile: { create: { bio: 'Administrador de DevbuPlaytime' } },
      progress: { create: { totalXp: 9999, level: 99, coins: 9999 } }
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
      displayName: 'DEVBU93',
      profile: { create: { bio: 'El fundador de DevbuPlaytime' } },
      progress: { create: {} }
    }
  });

  // World 1: Matemáticas
  const world1 = await prisma.world.upsert({
    where: { id: 'world-math-001' },
    update: {},
    create: {
      id: 'world-math-001',
      name: 'Reino de las Matemáticas',
      description: 'Domina los números y conviértete en el maestro del cálculo',
      theme: 'fantasy',
      difficulty: 'BEGINNER',
      order: 1,
      imageUrl: '/worlds/math.png',
      chapters: {
        create: [
          {
            name: 'Aritmética Básica',
            description: 'Suma, resta, multiplicación y división',
            order: 1,
            missions: {
              create: [
                {
                  name: 'Suma de Héroes',
                  description: 'Aprende a sumar con los héroes de la manada',
                  order: 1,
                  xpReward: 100,
                  coinReward: 10,
                  timeLimit: 120,
                  questions: {
                    create: [
                      { text: '¿Cuánto es 5 + 3?', type: 'MULTIPLE_CHOICE', options: ['6', '7', '8', '9'], correctAnswer: '8', points: 10, order: 1 },
                      { text: '¿Cuánto es 12 + 7?', type: 'MULTIPLE_CHOICE', options: ['17', '18', '19', '20'], correctAnswer: '19', points: 10, order: 2 },
                      { text: '¿Cuánto es 15 + 15?', type: 'MULTIPLE_CHOICE', options: ['28', '29', '30', '31'], correctAnswer: '30', points: 15, order: 3 }
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

  // Cosmetics
  await prisma.cosmetic.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Avatar Dragón', type: 'AVATAR', rarity: 'RARE', price: 500, imageUrl: '/cosmetics/dragon.png' },
      { name: 'Marco Legendario', type: 'BORDER', rarity: 'LEGENDARY', price: 1000, imageUrl: '/cosmetics/border-legendary.png' },
      { name: 'Título: Maestro', type: 'TITLE', rarity: 'EPIC', price: 750, imageUrl: '' }
    ]
  });

  // Achievements
  await prisma.achievement.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Primer Paso', description: 'Completa tu primera misión', icon: '🎯', condition: '{"type":"missions_completed","count":1}', xpReward: 50 },
      { name: 'Estudioso', description: 'Completa 10 misiones', icon: '📚', condition: '{"type":"missions_completed","count":10}', xpReward: 200 },
      { name: 'Campeón de Arena', description: 'Gana 5 partidas de arena', icon: '⚔️', condition: '{"type":"arena_wins","count":5}', xpReward: 300 }
    ]
  });

  console.log('✅ Seed completado!');
  console.log('👤 Admin: admin@devbuplaytime.com / Admin123!');
  console.log('👤 Demo: demo@devbuplaytime.com / User123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
