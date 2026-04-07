import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export const worldsController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const worlds = await prisma.world.findMany({
        where: { isActive: true },
        include: { chapters: { where: { isActive: true }, orderBy: { order: 'asc' } } },
        orderBy: { order: 'asc' }
      });
      res.json({ success: true, data: worlds });
    } catch (e) { next(e); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const world = await prisma.world.findUnique({
        where: { id: req.params.id },
        include: {
          chapters: {
            include: { missions: { include: { questions: true } } },
            orderBy: { order: 'asc' }
          }
        }
      });
      if (!world) throw new AppError('Mundo no encontrado', 404);
      res.json({ success: true, data: world });
    } catch (e) { next(e); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const world = await prisma.world.create({ data: req.body });
      res.status(201).json({ success: true, data: world });
    } catch (e) { next(e); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const world = await prisma.world.update({ where: { id: req.params.id }, data: req.body });
      res.json({ success: true, data: world });
    } catch (e) { next(e); }
  }
};
