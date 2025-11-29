import { Router } from 'express';
import { z } from 'zod';
import {
  createRestaurant,
  deleteRestaurant,
  getRestaurant,
  listRestaurants,
  updateRestaurant,
} from '../controllers/restaurantController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { UserRole } from '@prisma/client';

const router = Router();

const restaurantCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  photos: z.array(z.string().url()).optional(),
  deliveryFee: z.number().min(0),
  deliveryTimeMinutes: z.number().int().positive().optional(),
  categories: z.array(z.string().min(1)).optional(),
});

const restaurantUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  photos: z.array(z.string().url()).optional(),
  deliveryFee: z.number().min(0).optional(),
  deliveryTimeMinutes: z.number().int().positive().optional(),
  categories: z.array(z.string().min(1)).optional(),
});

router.get('/', listRestaurants);
router.get('/:id', getRestaurant);
router.post('/', authenticate, requireRole(UserRole.VENDOR), validateBody(restaurantCreateSchema), createRestaurant);
router.patch(
  '/:id',
  authenticate,
  requireRole(UserRole.VENDOR),
  validateBody(restaurantUpdateSchema),
  updateRestaurant,
);
router.delete(
  '/:id',
  authenticate,
  requireRole([UserRole.VENDOR, UserRole.ADMIN]),
  deleteRestaurant,
);

export default router;
