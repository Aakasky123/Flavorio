import express, { Router } from 'express';
import { z } from 'zod';
import { createPaymentIntent, getPaymentForOrder, handleStripeWebhook } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const createIntentSchema = z.object({
  orderId: z.string(),
  paymentMethodType: z.string().optional(),
});

router.post(
  '/create-intent',
  authenticate,
  validateBody(createIntentSchema),
  createPaymentIntent
);

router.get('/order/:orderId', authenticate, getPaymentForOrder);
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
