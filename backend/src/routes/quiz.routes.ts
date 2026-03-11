import { Router } from 'express';
import { quizController } from '../controllers/quiz.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.post('/session/start', quizController.startSession);
router.post('/session/answer', quizController.submitAnswer);
router.post('/session/complete', quizController.completeSession);

export default router;
