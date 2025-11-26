import { Router } from 'express';
import { z } from 'zod';
import { acceptOrder, listAvailableOrders } from '../controllers/driverController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const acceptSchema = z.object({ driverId: z.string() });

router.get('/available-orders', authenticate, listAvailableOrders);
router.post('/:id/accept', authenticate, validateBody(acceptSchema), acceptOrder);

export default router;
