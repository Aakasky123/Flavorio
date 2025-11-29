import { Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';

const ensureVendorOwnsRestaurant = async (restaurantVendorId: string, userId: string) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) return false;

  return vendor.id === restaurantVendorId;
};

export const createRestaurant = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
  if (!vendor) {
    return res.status(403).json({ message: 'Vendor profile not found' });
  }

  const { categories = [], ...data } = req.body as {
    name: string;
    description?: string;
    imageUrl?: string;
    photos?: string[];
    deliveryFee: number;
    deliveryTimeMinutes?: number;
    categories?: string[];
  };

  const restaurant = await prisma.restaurant.create({
    data: {
      ...data,
      vendorId: vendor.id,
      photos: data.photos ?? [],
      categories: {
        create: categories.map((name) => ({ name })),
      },
    },
    include: {
      categories: true,
    },
  });

  return res.status(201).json(restaurant);
};

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

export const updateRestaurant = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { categories, ...data } = req.body as {
    name?: string;
    description?: string;
    imageUrl?: string;
    photos?: string[];
    deliveryFee?: number;
    deliveryTimeMinutes?: number;
    categories?: string[];
  };

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: req.params.id },
    select: { id: true, vendorId: true },
  });

  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found' });
  }

  if (
    req.user.role !== UserRole.ADMIN &&
    !(await ensureVendorOwnsRestaurant(restaurant.vendorId, req.user.id))
  ) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (categories) {
      await tx.category.deleteMany({ where: { restaurantId: restaurant.id } });
    }

    return tx.restaurant.update({
      where: { id: restaurant.id },
      data: {
        ...data,
        ...(categories ? { categories: { create: categories.map((name) => ({ name })) } } : {}),
      },
      include: { categories: true },
    });
  });

  return res.json(updated);
};

export const deleteRestaurant = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.user.role === UserRole.ADMIN) {
    const existing = await prisma.restaurant.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    await prisma.restaurant.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: req.params.id },
    select: { id: true, vendorId: true },
  });

  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found' });
  }

  const ownsRestaurant = await ensureVendorOwnsRestaurant(restaurant.vendorId, req.user.id);
  if (!ownsRestaurant) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  await prisma.restaurant.delete({ where: { id: restaurant.id } });
  return res.status(204).send();
};
