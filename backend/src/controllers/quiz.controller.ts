import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

export const quizController = {
  async startSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { missionId } = req.body;
      if (!missionId) throw new AppError('missionId requerido', 400);

      const mission = await prisma.mission.findUnique({
        where: { id: missionId },
        include: { questions: { orderBy: { order: 'asc' } } }
      });
      if (!mission) throw new AppError('Misión no encontrada', 404);

      const session = await prisma.quizSession.create({
        data: { userId: req.user!.id, missionId, totalQuestions: mission.questions.length }
      });

      res.status(201).json({
        success: true,
        data: {
          sessionId: session.id,
          questions: mission.questions.map(q => ({
            id: q.id, text: q.text, type: q.type, options: q.options, points: q.points
          }))
        }
      });
    } catch (e) { next(e); }
  },

  async submitAnswer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { sessionId, questionId, answer } = req.body;
      const question = await prisma.question.findUnique({ where: { id: questionId } });
      if (!question) throw new AppError('Pregunta no encontrada', 404);

      const isCorrect = JSON.stringify(question.correctAnswer) === JSON.stringify(answer);
      const pointsEarned = isCorrect ? question.points : 0;

      if (isCorrect) {
        await prisma.userProgress.update({
          where: { userId: req.user!.id },
          data: { totalXp: { increment: pointsEarned } }
        });
      }

      res.json({ success: true, data: { isCorrect, pointsEarned, correctAnswer: question.correctAnswer } });
    } catch (e) { next(e); }
  },

  async completeSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { sessionId, score, correctAnswers } = req.body;
      const session = await prisma.quizSession.update({
        where: { id: sessionId },
        data: { score, correctAnswers, completedAt: new Date(), status: 'COMPLETED' }
      });
      res.json({ success: true, data: session });
    } catch (e) { next(e); }
  }
};
