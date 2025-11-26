import { Router } from 'express';
import { getRestaurant, listRestaurants } from '../controllers/restaurantController.js';

const router = Router();

router.get('/', listRestaurants);
router.get('/:id', getRestaurant);

export default router;
