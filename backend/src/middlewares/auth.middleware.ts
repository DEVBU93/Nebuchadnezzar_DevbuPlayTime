import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { AppError } from './errorHandler';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: { id: string; username: string; email: string; role: string };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Token no proporcionado' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, email: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'Token inválido o usuario inactivo' });
      return;
    }

    req.user = { id: user.id, username: user.username, email: user.email, role: user.role };
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(401).json({ success: false, message: 'Token inválido' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Sin permisos suficientes' });
      return;
    }
    next();
  };
  
  export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // ✅ FIX: headers viene de Request — ya disponible al extender correctamente
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token no proporcionado', 401);
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new AppError('JWT_SECRET no configurado', 500);
    }

    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      role: string;
    };

    req.user = decoded;
    next();
  } catch (e) {
    if (e instanceof AppError) return next(e);
    next(new AppError('Token inválido o expirado', 401));
  }
};
};
