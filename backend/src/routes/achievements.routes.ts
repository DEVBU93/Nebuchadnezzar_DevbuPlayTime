import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middlewares/auth.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res, next) => {
  try {
    const achievements = await prisma.achievement.findMany();
    res.json({ success: true, data: achievements });
  } catch (e) { next(e); }
});

router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userAchievements = await prisma.userProgress.findUnique({
      where: { userId: req.user!.id },
      include: { achievements: true }
    });
    res.json({ success: true, data: userAchievements?.achievements || [] });
  } catch (e) { next(e); }
});

export default router;
