import { Router } from 'express';
import { z } from 'zod';
import { createMenuItem, listMenuItems, updateMenuItem } from '../controllers/menuController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router({ mergeParams: true });

const menuItemSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.number().positive(),
  imageUrl: z.string().url().optional(),
  restaurantId: z.string(),
  categoryId: z.string().optional(),
  isAvailable: z.boolean().optional(),
});

router.get('/', listMenuItems);
router.post('/', authenticate, validateBody(menuItemSchema), createMenuItem);
router.put('/:id', authenticate, validateBody(menuItemSchema.partial()), updateMenuItem);

export default router;
