import { Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';

const ensureVendorOwnsRestaurant = async (restaurantId: string, userId: string) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) return null;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { id: true, vendorId: true },
  });

  if (!restaurant || restaurant.vendorId !== vendor.id) return null;

  return restaurant;
};

const assertVendorOwnershipByMenuItem = async (menuItemId: string, userId: string) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) return null;

  const menuItem = await prisma.menuItem.findUnique({
    where: { id: menuItemId },
    select: { id: true, restaurant: { select: { id: true, vendorId: true } } },
  });

  if (!menuItem || menuItem.restaurant.vendorId !== vendor.id) return null;

  return menuItem;
};

export const createMenuItem = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const restaurantId = req.params.restaurantId;
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { id: true, vendorId: true },
  });

  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found' });
  }

  if (req.user.role !== UserRole.ADMIN) {
    const owned = await ensureVendorOwnsRestaurant(restaurantId, req.user.id);
    if (!owned) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  }

  const { categoryId, categoryName, ...data } = req.body as {
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    isAvailable?: boolean;
    categoryId?: string;
    categoryName?: string;
  };

  let resolvedCategoryId = categoryId;
  if (categoryName && !categoryId) {
    const newCategory = await prisma.category.create({
      data: { name: categoryName, restaurantId: restaurantId },
    });
    resolvedCategoryId = newCategory.id;
  }

  const item = await prisma.menuItem.create({
    data: {
      ...data,
      restaurantId,
      categoryId: resolvedCategoryId,
    },
  });
  return res.status(201).json(item);
};

export const updateMenuItem = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { categoryId, categoryName, ...data } = req.body as {
    name?: string;
    description?: string;
    price?: number;
    imageUrl?: string;
    isAvailable?: boolean;
    categoryId?: string;
    categoryName?: string;
  };

  const menuItem = await prisma.menuItem.findUnique({
    where: { id: req.params.id },
    select: { id: true, restaurantId: true },
  });

  if (!menuItem) {
    return res.status(404).json({ message: 'Menu item not found' });
  }

  if (req.user.role !== UserRole.ADMIN) {
    const owned = await assertVendorOwnershipByMenuItem(req.params.id, req.user.id);
    if (!owned) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  }

  let resolvedCategoryId = categoryId;
  if (categoryName && !categoryId) {
    const newCategory = await prisma.category.create({
      data: { name: categoryName, restaurantId: menuItem.restaurantId },
    });
    resolvedCategoryId = newCategory.id;
  }

  const updated = await prisma.menuItem.update({
    where: { id: req.params.id },
    data: {
      ...data,
      ...(resolvedCategoryId ? { categoryId: resolvedCategoryId } : {}),
    },
  });
  return res.json(updated);
};

export const deleteMenuItem = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const menuItem = await prisma.menuItem.findUnique({
    where: { id: req.params.id },
    select: { id: true },
  });

  if (!menuItem) {
    return res.status(404).json({ message: 'Menu item not found' });
  }

  if (req.user.role !== UserRole.ADMIN) {
    const owned = await assertVendorOwnershipByMenuItem(req.params.id, req.user.id);
    if (!owned) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  }

  await prisma.menuItem.delete({ where: { id: req.params.id } });
  return res.status(204).send();
};

export const listMenuItems = async (req: Request, res: Response) => {
  const items = await prisma.menuItem.findMany({
    where: { restaurantId: req.params.restaurantId },
  });
  return res.json(items);
};

export const getMenuItem = async (req: Request, res: Response) => {
  const item = await prisma.menuItem.findUnique({ where: { id: req.params.id } });
  if (!item) {
    return res.status(404).json({ message: 'Menu item not found' });
  }
  return res.json(item);
};
