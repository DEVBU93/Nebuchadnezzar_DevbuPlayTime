import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface RegisterDTO {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

const generateTokens = (userId: string) => {
  const accessToken = (jwt as any).sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
  const refreshToken = (jwt as any).sign({ userId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!, {
    expiresIn: '30d'
  });
  return { accessToken, refreshToken };
};

export const authService = {
  async register(dto: RegisterDTO) {
    const exists = await prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] }
    });
    if (exists) {
      throw new AppError(
        exists.email === dto.email ? 'Email ya registrado' : 'Username ya en uso',
        409
      );
    }
    const hashedPassword = await (bcrypt as any).hash(dto.password, 12);
    const user = await prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        passwordHash: hashedPassword,
        profile: { create: { displayName: dto.displayName || dto.username } }
      },
      select: { id: true, username: true, email: true, role: true, createdAt: true }
    });
    const tokens = generateTokens(user.id);
    logger.info(`Nuevo usuario registrado: ${user.username}`);
    return { user, ...tokens };
  },

  async login(dto: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, username: true, email: true, role: true, passwordHash: true, isActive: true }
    });
    if (!user || !user.isActive) {
      throw new AppError('Credenciales invalidas', 401);
    }
    const validPassword = await (bcrypt as any).compare(dto.password, user.passwordHash);
    if (!validPassword) {
      throw new AppError('Credenciales invalidas', 401);
    }
    // Update lastLoginAt in profile
    await prisma.userProfile.updateMany({ where: { userId: user.id }, data: { lastLoginAt: new Date() } });
    const { passwordHash, ...userSafe } = user;
    const tokens = generateTokens(user.id);
    logger.info(`Login exitoso: ${user.username}`);
    return { user: userSafe, ...tokens };
  },

  async refreshToken(token: string) {
    try {
      const decoded = (jwt as any).verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!) as { userId: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user || !user.isActive) throw new AppError('Token invalido', 401);
      return generateTokens(user.id);
    } catch {
      throw new AppError('Refresh token invalido', 401);
    }
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, progress: true }
    });
    if (!user) throw new AppError('Usuario no encontrado', 404);
    const { passwordHash, ...userSafe } = user;
    return userSafe;
  }
};
