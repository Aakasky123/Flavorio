import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';
import { getIo } from '../services/socket.js';

const ACTIVE_DRIVER_STATUSES = ['ASSIGNED', 'PICKED_UP', 'ON_THE_WAY'];

export const updateDriverLocation = async (req: AuthRequest, res: Response) => {
  const { latitude, longitude } = req.body as { latitude: number; longitude: number };

  const driver = await prisma.driver.findUnique({ where: { userId: req.user!.id } });
  if (!driver) return res.status(404).json({ message: 'Driver profile not found' });

  const location = await prisma.driverLocation.upsert({
    where: { driverId: driver.id },
    create: { driverId: driver.id, latitude, longitude },
    update: { latitude, longitude },
  });

  const activeOrders = await prisma.order.findMany({
    where: { driverId: driver.id, status: { in: ACTIVE_DRIVER_STATUSES } },
    select: { id: true },
  });

  const io = getIo();
  if (io) {
    activeOrders.forEach((order) => {
      io.to(`order:${order.id}`).emit('driver_location_updated', {
        orderId: order.id,
        driverId: driver.id,
        latitude,
        longitude,
      });
    });
  }

  return res.json(location);
};
