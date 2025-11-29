import { Router } from 'express';
import { z } from 'zod';
import {
  createMenuItem,
  deleteMenuItem,
  getMenuItem,
  listMenuItems,
  updateMenuItem,
} from '../controllers/menuController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { UserRole } from '@prisma/client';

const restaurantMenuRouter = Router({ mergeParams: true });
const menuRouter = Router();

const baseMenuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().optional(),
  categoryId: z.string().optional(),
  categoryName: z.string().min(1).optional(),
});

const menuItemUpdateSchema = baseMenuItemSchema.partial();

restaurantMenuRouter.get('/', listMenuItems);
restaurantMenuRouter.post(
  '/',
  authenticate,
  requireRole(UserRole.VENDOR),
  validateBody(baseMenuItemSchema),
  createMenuItem,
);

menuRouter.get('/:id', getMenuItem);
menuRouter.patch(
  '/:id',
  authenticate,
  requireRole(UserRole.VENDOR),
  validateBody(menuItemUpdateSchema),
  updateMenuItem,
);
menuRouter.delete('/:id', authenticate, requireRole(UserRole.VENDOR), deleteMenuItem);

export { restaurantMenuRouter };
export default menuRouter;
