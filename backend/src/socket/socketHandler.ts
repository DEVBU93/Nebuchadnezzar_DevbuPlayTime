import { Server as IOServer, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export const setupSocketHandlers = (io: IOServer): void => {
  // Auth middleware - optional, sockets can work without auth for basic arena
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (token) {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (user) {
          socket.userId = user.id;
          socket.username = user.username;
        }
      }
      next();
    } catch {
      next();
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Socket connected: ${socket.username || 'anonymous'} (${socket.userId || socket.id})`);

    // Join arena room
    socket.on('arena:join', async (roomCode: string) => {
      socket.join(`arena:${roomCode}`);
      io.to(`arena:${roomCode}`).emit('arena:player_joined', {
        userId: socket.userId,
        username: socket.username
      });
      // Create arena session entry if user is authenticated
      if (socket.userId) {
        try {
          await prisma.arenaSession.create({
            data: {
              userId: socket.userId,
              roomCode,
              isHost: false,
              status: 'ACTIVE'
            }
          });
        } catch (e) {
          // Session may already exist
        }
      }
    });

    // Arena: submit answer
    socket.on('arena:answer', async ({ roomCode, questionId, answer, timeLeft }: any) => {
      socket.to(`arena:${roomCode}`).emit('arena:opponent_answered', { questionId, timeLeft });
    });

    // Arena: match complete
    socket.on('arena:complete', async ({ roomCode, score }: any) => {
      if (socket.userId) {
        try {
          await prisma.arenaSession.updateMany({
            where: { userId: socket.userId, roomCode, status: 'ACTIVE' },
            data: { score, status: 'COMPLETED', finishedAt: new Date() }
          });
        } catch (e) {
          logger.error('Error updating arena session', e);
        }
      }
      io.to(`arena:${roomCode}`).emit('arena:match_result', { roomCode, userId: socket.userId, score });
    });

    // Quiz: real-time progress
    socket.on('quiz:progress', ({ sessionId, questionIndex, totalQuestions }: any) => {
      socket.broadcast.emit('quiz:live_update', {
        userId: socket.userId,
        progress: Math.round((questionIndex / totalQuestions) * 100)
      });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.username || socket.id}`);
    });
  });
};
