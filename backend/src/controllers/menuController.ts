import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const createMenuItem = async (req: Request, res: Response) => {
  const item = await prisma.menuItem.create({ data: req.body });
  return res.status(201).json(item);
};

export const updateMenuItem = async (req: Request, res: Response) => {
  const updated = await prisma.menuItem.update({
    where: { id: req.params.id },
    data: req.body,
  });
  return res.json(updated);
};

export const listMenuItems = async (req: Request, res: Response) => {
  const items = await prisma.menuItem.findMany({
    where: { restaurantId: req.params.restaurantId },
  });
  return res.json(items);
};
