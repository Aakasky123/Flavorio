import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const listAvailableOrders = async (_req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { status: 'READY_FOR_PICKUP' },
    include: { restaurant: true },
  });
  return res.json(orders);
};

export const acceptOrder = async (req: Request, res: Response) => {
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { driverId: req.body.driverId, status: 'ON_THE_WAY' },
  });
  return res.json(order);
};
