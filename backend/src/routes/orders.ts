import { Router } from 'express';
import { z } from 'zod';
import { createOrder, listOrders, updateOrderStatus } from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const orderSchema = z.object({
  restaurantId: z.string(),
  total: z.number().positive(),
  items: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  })),
});

const statusSchema = z.object({ status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED']) });

router.use(authenticate);
router.get('/', listOrders);
router.post('/', validateBody(orderSchema), createOrder);
router.patch('/:id/status', validateBody(statusSchema), updateOrderStatus);

export default router;
