import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createAddress, deleteAddress, getAddress, listAddresses } from '../controllers/addressController.js';

const router = Router();

const addressSchema = z.object({
  name: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(3),
  phone: z.string().min(5),
  label: z.string().optional(),
});

router.use(authenticate);
router.post('/', validateBody(addressSchema), createAddress);
router.get('/', listAddresses);
router.get('/:id', getAddress);
router.delete('/:id', deleteAddress);

export default router;
