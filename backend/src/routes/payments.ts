import { Router } from 'express';
import { z } from 'zod';
import { createPayment, listPayments } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const paymentSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  status: z.enum(['PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED']),
  provider: z.enum(['STRIPE', 'CASH']),
  transactionId: z.string().optional(),
});

router.use(authenticate);
router.get('/', listPayments);
router.post('/', validateBody(paymentSchema), createPayment);

export default router;
