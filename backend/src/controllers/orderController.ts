import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';

export const createOrder = async (req: AuthRequest, res: Response) => {
  const order = await prisma.order.create({
    data: {
      userId: req.user!.id,
      restaurantId: req.body.restaurantId,
      status: 'PENDING',
      total: req.body.total,
      items: {
        create: req.body.items.map((item: any) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: { items: true },
  });
  return res.status(201).json(order);
};

export const listOrders = async (req: AuthRequest, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.id },
    include: { items: true, restaurant: true },
  });
  return res.json(orders);
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
  });
  return res.json(updated);
};
