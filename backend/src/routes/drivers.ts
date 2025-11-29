import { Router } from 'express';
import { z } from 'zod';
import { updateDriverLocation } from '../controllers/driverController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const locationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

router.patch('/location', authenticate, requireRole('DRIVER'), validateBody(locationSchema), updateDriverLocation);

export default router;
