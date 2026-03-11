import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export const arenaController = {
  async findMatch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Find a waiting session or create one
      const waiting = await prisma.arenaSession.findFirst({
        where: { status: 'WAITING', NOT: { player1Id: req.user!.id } }
      });

      if (waiting) {
        const match = await prisma.arenaSession.update({
          where: { id: waiting.id },
          data: { player2Id: req.user!.id, status: 'ACTIVE', startedAt: new Date() }
        });
        res.json({ success: true, data: { matchId: match.id, status: 'matched', opponentId: match.player1Id } });
      } else {
        const session = await prisma.arenaSession.create({
          data: { player1Id: req.user!.id, status: 'WAITING' }
        });
        res.json({ success: true, data: { matchId: session.id, status: 'waiting' } });
      }
    } catch (e) { next(e); }
  },

  async getMatchStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const match = await prisma.arenaSession.findUnique({ where: { id: req.params.matchId } });
      if (!match) { res.status(404).json({ success: false, message: 'Partida no encontrada' }); return; }
      res.json({ success: true, data: match });
    } catch (e) { next(e); }
  },

  async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sessions = await prisma.arenaSession.findMany({
        where: { OR: [{ player1Id: req.user!.id }, { player2Id: req.user!.id }] },
        orderBy: { createdAt: 'desc' },
        take: 20
      });
      res.json({ success: true, data: sessions });
    } catch (e) { next(e); }
  }
};
