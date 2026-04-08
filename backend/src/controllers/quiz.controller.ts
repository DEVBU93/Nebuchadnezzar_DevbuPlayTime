import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const quizController = {
  /**
   * Inicia una sesión de Quiz para una misión específica.
   */
  async startSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { missionId } = req.body;
      const userId = req.user!.id;

      if (!missionId) throw new AppError('missionId requerido', 400);

      const mission = await prisma.mission.findUnique({
        where: { id: missionId },
        include: { questions: { where: { isActive: true } } }
      });

      if (!mission) throw new AppError('Misión no encontrada', 404);

      // Crear la sesión en la base de datos
      const session = await prisma.quizSession.create({
        data: {
          userId,
          missionId,
          status: 'ACTIVE',
          answers: [],
          startedAt: new Date()
        }
      });

      logger.info(`Sesión de Quiz iniciada: ${session.id} para el usuario ${userId}`);

      res.status(201).json({
        success: true,
        data: {
          sessionId: session.id,
          missionName: mission.name,
          totalQuestions: mission.questions.length,
          questions: mission.questions.map(q => ({
            id: q.id,
            text: q.text,
            type: q.type,
            options: q.options,
            points: q.points,
            timeLimit: q.timeLimit
          }))
        }
      });
    } catch (e) {
      next(e);
    }
  },

  /**
   * Procesa una respuesta individual y actualiza la sesión.
   */
  async submitAnswer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { sessionId, questionId, answer } = req.body;
      const userId = req.user!.id;

      if (!sessionId || !questionId) {
        throw new AppError('sessionId y questionId son requeridos', 400);
      }

      // Validar que la sesión existe y pertenece al usuario
      const session = await prisma.quizSession.findFirst({
        where: { id: sessionId, userId, status: 'ACTIVE' }
      });

      if (!session) throw new AppError('Sesión no válida o ya finalizada', 403);

      // Obtener la pregunta y validar respuesta
      const question = await prisma.question.findUnique({ where: { id: questionId } });
      if (!question) throw new AppError('Pregunta no encontrada', 404);

      const isCorrect = String(question.correctAnswer).trim().toLowerCase() === String(answer).trim().toLowerCase();
      const pointsEarned = isCorrect ? question.points : 0;

      // Actualizar el array de respuestas en la sesión (usando un cast a any para manejar Json de Prisma)
      const currentAnswers = (session.answers as any[]) || [];
      const updatedAnswers = [...currentAnswers, { questionId, answer, isCorrect, pointsEarned, timestamp: new Date() }];

      await prisma.quizSession.update({
        where: { id: sessionId },
        data: {
          answers: updatedAnswers,
          score: { increment: pointsEarned },
          correctCount: isCorrect ? { increment: 1 } : undefined,
          wrongCount: !isCorrect ? { increment: 1 } : undefined
        }
      });

      res.json({
        success: true,
        data: {
          isCorrect,
          pointsEarned,
          correctAnswer: isCorrect ? undefined : question.correctAnswer,
          explanation: question.explanation
        }
      });
    } catch (e) {
      next(e);
    }
  },

  /**
   * Finaliza la sesión, calcula recompensas finales y actualiza el perfil del usuario.
   */
  async completeSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.body;
      const userId = req.user!.id;

      const session = await prisma.quizSession.findFirst({
        where: { id: sessionId, userId, status: 'ACTIVE' },
        include: { mission: true }
      });

      if (!session) throw new AppError('Sesión no encontrada o ya procesada', 404);

      // Calcular recompensas (XP y Coins de la misión)
      const xpReward = session.mission.xpReward || 0;
      const coinReward = session.mission.coinReward || 0;

      // Actualizar sesión a COMPLETED
      const updatedSession = await prisma.quizSession.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED',
          finishedAt: new Date()
        }
      });

      // Actualizar perfil del usuario con las recompensas
      const updatedProfile = await prisma.userProfile.update({
        where: { userId },
        data: {
          xp: { increment: xpReward + session.score },
          coins: { increment: coinReward }
        }
      });

      // Registrar progreso del usuario en la misión
      await prisma.userProgress.upsert({
        where: { userId_missionId: { userId, missionId: session.missionId } },
        update: {
          status: 'COMPLETED',
          score: session.score,
          completedAt: new Date()
        },
        create: {
          userId,
          missionId: session.missionId,
          status: 'COMPLETED',
          score: session.score
        }
      });

      logger.info(`Sesión completada: ${sessionId}. Usuario ${userId} ganó ${xpReward + session.score} XP y ${coinReward} Coins.`);

      res.json({
        success: true,
        data: {
          session: updatedSession,
          rewards: { xp: xpReward + session.score, coins: coinReward },
          newStats: { xp: updatedProfile.xp, coins: updatedProfile.coins, level: updatedProfile.level }
        }
      });
    } catch (e) {
      next(e);
    }
  }
};
