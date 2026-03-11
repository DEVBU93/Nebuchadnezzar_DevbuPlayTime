import { Router } from 'express';
import { worldsController } from '../controllers/worlds.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.get('/', worldsController.getAll);
router.get('/:id', worldsController.getById);
router.post('/', authenticate, authorize('ADMIN'), worldsController.create);
router.put('/:id', authenticate, authorize('ADMIN'), worldsController.update);

export default router;
