import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middlewares/auth.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/cosmetics - list all active cosmetics
router.get('/', async (_req, res, next) => {
  try {
    const cosmetics = await prisma.cosmetic.findMany({ where: { isActive: true } });
    res.json({ success: true, data: cosmetics });
  } catch (e) { next(e); }
});

// POST /api/cosmetics/purchase/:id - purchase a cosmetic using coins from userProfile
router.post('/purchase/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const cosmetic = await prisma.cosmetic.findUnique({ where: { id: req.params.id } });
    if (!cosmetic) { res.status(404).json({ success: false, message: 'Cosmético no encontrado' }); return; }

    const profile = await prisma.userProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile || profile.coins < cosmetic.price) {
      res.status(400).json({ success: false, message: 'Monedas insuficientes' }); return;
    }

    const [userCosmetic] = await prisma.$transaction([
      prisma.userCosmetic.create({ data: { userId: req.user!.id, cosmeticId: req.params.id } }),
      prisma.userProfile.update({ where: { userId: req.user!.id }, data: { coins: { decrement: cosmetic.price } } })
    ]);
    res.json({ success: true, data: userCosmetic });
  } catch (e) { next(e); }
});

// GET /api/cosmetics/me - get user's owned cosmetics
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userCosmetics = await prisma.userCosmetic.findMany({
      where: { userId: req.user!.id },
      include: { cosmetic: true }
    });
    res.json({ success: true, data: userCosmetics });
  } catch (e) { next(e); }
});

export default router;
