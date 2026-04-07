import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

export const usersService = {
  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true, progress: true, achievements: true }
    });
    if (!user) throw new AppError('Usuario no encontrado', 404);
    const { passwordHash, ...safe } = user;
    return safe;
  },

  async updateProfile(userId: string, data: { displayName?: string; bio?: string; avatar?: string }) {
    return prisma.userProfile.upsert({
      where: { userId },
      update: {
        displayName: data.displayName,
        avatar: data.avatar,
        bio: data.bio
      },
      create: {
        userId,
        displayName: data.displayName,
        avatar: data.avatar,
        bio: data.bio
      }
    });
  },

  async getLeaderboard(limit = 10) {
    return prisma.userProgress.findMany({
      take: limit,
      orderBy: { score: 'desc' },
      include: { user: { select: { id: true, username: true, email: true } } }
    });
  },

  async getUserCosmetics(userId: string) {
    return prisma.userCosmetic.findMany({
      where: { userId },
      include: { cosmetic: true }
    });
  }
};
