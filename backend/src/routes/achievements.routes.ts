import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middlewares/auth.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/achievements - list all achievements
router.get('/', async (_req, res, next) => {
  try {
    const achievements = await prisma.achievement.findMany();
    res.json({ success: true, data: achievements });
  } catch (e) { next(e); }
});

// GET /api/achievements/me - get current user's unlocked achievements
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: req.user!.id },
      include: { achievement: true }
    });
    res.json({ success: true, data: userAchievements });
  } catch (e) { next(e); }
});

export default router;
