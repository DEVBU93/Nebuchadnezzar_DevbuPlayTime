import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middlewares/auth.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const progress = await prisma.userProgress.findUnique({
      where: { userId: req.user!.id }
    });
    res.json({ success: true, data: progress });
  } catch (e) { next(e); }
});

export default router;
