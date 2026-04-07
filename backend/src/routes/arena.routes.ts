import { Router } from 'express';
import { arenaController } from '../controllers/arena.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.post('/match', arenaController.findMatch);
router.get('/match/:roomCode', arenaController.getMatchStatus);
router.get('/history', arenaController.getHistory);

export default router;
