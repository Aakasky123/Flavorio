import { Router } from 'express';
import { z } from 'zod';
import {
  acceptOrder,
  assignOrder,
  createOrder,
  deliverOrder,
  getDriverOrders,
  getUserOrders,
  getVendorOrders,
  listAvailableOrders,
  markOrderReadyForPickup,
  pickupOrder,
  rejectOrder,
  getOrderTracking,
} from '../controllers/orderController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const orderItemSchema = z.object({
  menuItemId: z.string(),
  quantity: z.number().int().positive(),
});

const createOrderSchema = z.object({
  restaurantId: z.string(),
  addressId: z.string(),
  deliveryNotes: z.string().optional(),
  paymentMethod: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
});

router.post('/', authenticate, requireRole('CUSTOMER'), validateBody(createOrderSchema), createOrder);

router.get('/user', authenticate, requireRole('CUSTOMER'), getUserOrders);
router.get('/vendor', authenticate, requireRole('VENDOR'), getVendorOrders);
router.get('/driver', authenticate, requireRole('DRIVER'), getDriverOrders);
router.get('/available', authenticate, requireRole('DRIVER'), listAvailableOrders);

router.patch('/:id/accept', authenticate, requireRole('VENDOR'), acceptOrder);
router.patch('/:id/reject', authenticate, requireRole('VENDOR'), rejectOrder);
router.patch('/:id/ready', authenticate, requireRole('VENDOR'), markOrderReadyForPickup);

router.patch('/:id/assign', authenticate, requireRole('DRIVER'), assignOrder);
router.patch('/:id/pickup', authenticate, requireRole('DRIVER'), pickupOrder);
router.patch('/:id/deliver', authenticate, requireRole('DRIVER'), deliverOrder);
router.get('/:id/tracking', authenticate, getOrderTracking);

export default router;
