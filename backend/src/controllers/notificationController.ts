import { AuthRequest } from '../middleware/auth.js';
import { Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const listNotifications = async (req: AuthRequest, res: Response) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.id },
  });
  return res.json(notifications);
};

export const markRead = async (req: AuthRequest, res: Response) => {
  const notification = await prisma.notification.update({
    where: { id: req.params.id },
    data: { read: true },
  });
  return res.json(notification);
};
