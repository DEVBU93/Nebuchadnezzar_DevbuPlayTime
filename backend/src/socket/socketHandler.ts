import { Server as IOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export const setupSocketHandlers = (io: IOServer): void => {
  // Auth middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('No token provided'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) return next(new Error('Invalid token'));

      socket.userId = user.id;
      socket.username = user.username;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Socket connected: ${socket.username} (${socket.userId})`);

    // Join arena room
    socket.on('arena:join', async (matchId: string) => {
      socket.join(`arena:${matchId}`);
      io.to(`arena:${matchId}`).emit('arena:player_joined', {
        userId: socket.userId,
        username: socket.username
      });
    });

    // Arena: submit answer
    socket.on('arena:answer', async ({ matchId, questionId, answer, timeLeft }) => {
      socket.to(`arena:${matchId}`).emit('arena:opponent_answered', { questionId, timeLeft });
    });

    // Arena: match complete
    socket.on('arena:complete', async ({ matchId, score }) => {
      const match = await prisma.arenaSession.findUnique({ where: { id: matchId } });
      if (!match) return;

      const isPlayer1 = match.player1Id === socket.userId;
      await prisma.arenaSession.update({
        where: { id: matchId },
        data: isPlayer1
          ? { player1Score: score }
          : { player2Score: score, status: 'COMPLETED', completedAt: new Date() }
      });

      io.to(`arena:${matchId}`).emit('arena:match_result', { matchId, [socket.userId!]: score });
    });

    // Quiz: real-time progress
    socket.on('quiz:progress', ({ sessionId, questionIndex, totalQuestions }) => {
      socket.broadcast.emit('quiz:live_update', {
        userId: socket.userId,
        progress: Math.round((questionIndex / totalQuestions) * 100)
      });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.username}`);
    });
  });
};
