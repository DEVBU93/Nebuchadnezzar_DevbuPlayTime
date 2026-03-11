import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/me', usersController.getProfile);
router.put('/me', usersController.updateProfile);
router.get('/leaderboard', usersController.getLeaderboard);
router.get('/me/cosmetics', usersController.getCosmetics);
router.get('/:id', usersController.getProfile);

export default router;
