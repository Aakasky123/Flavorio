import { Router } from 'express';
import authRoutes from './auth.js';
import restaurantRoutes from './restaurants.js';
import menuRoutes, { restaurantMenuRouter } from './menu.js';
import orderRoutes from './orders.js';
import driverRoutes from './drivers.js';
import paymentRoutes from './payments.js';
import notificationRoutes from './notifications.js';
import addressRoutes from './addresses.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/restaurants/:restaurantId/menu', restaurantMenuRouter);
router.use('/menu', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/drivers', driverRoutes);
router.use('/payments', paymentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/addresses', addressRoutes);

export default router;
