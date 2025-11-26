import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const listRestaurants = async (_req: Request, res: Response) => {
  const restaurants = await prisma.restaurant.findMany({
    include: { categories: true, menuItems: true },
  });
  return res.json(restaurants);
};

export const getRestaurant = async (req: Request, res: Response) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: req.params.id },
    include: { categories: true, menuItems: true, reviews: true },
  });
  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found' });
  }
  return res.json(restaurant);
};
