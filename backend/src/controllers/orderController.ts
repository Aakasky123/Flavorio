import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';
import { getIo } from '../services/socket.js';

const TAX_RATE = 0.08;

const emitOrderEvent = (event: string, order: any) => {
  const io = getIo();
  if (!io) return;

  io.emit(event, order);
  io.to(`order:${order.id}`).emit(event, order);
};

const emitOrderStatus = (order: { id: string; status: string }) => {
  const io = getIo();
  if (!io) return;

  const payload = { orderId: order.id, status: order.status };
  io.emit('order_status_updated', payload);
  io.to(`order:${order.id}`).emit('order_status_updated', payload);
};

const calculateTotals = (items: { menuItemId: string; quantity: number }[], menuPricing: Map<string, Prisma.Decimal>, deliveryFee: Prisma.Decimal) => {
  let subtotal = new Prisma.Decimal(0);

  items.forEach((item) => {
    const price = menuPricing.get(item.menuItemId);
    if (!price) return;
    subtotal = subtotal.plus(price.mul(item.quantity));
  });

  const tax = subtotal.mul(TAX_RATE);
  const total = subtotal.plus(tax).plus(deliveryFee);

  return { subtotal, tax, deliveryFee, total };
};

const ensureVendorOwnsOrder = async (orderId: string, userId: string) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) return null;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { restaurant: true },
  });

  if (!order || order.restaurant.vendorId !== vendor.id) {
    return null;
  }

  return order;
};

const ensureDriverForUser = async (userId: string) => prisma.driver.findUnique({ where: { userId } });

export const createOrder = async (req: AuthRequest, res: Response) => {
  const { restaurantId, items, addressId, deliveryNotes, paymentMethod } = req.body;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { id: true, deliveryFee: true },
  });

  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found' });
  }

  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== req.user!.id) {
    return res.status(400).json({ message: 'Invalid delivery address' });
  }

  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: items.map((i: any) => i.menuItemId) } },
    select: { id: true, price: true, restaurantId: true },
  });

  if (menuItems.length !== items.length) {
    return res.status(400).json({ message: 'One or more menu items are invalid' });
  }

  const invalidRestaurant = menuItems.some((m) => m.restaurantId !== restaurantId);
  if (invalidRestaurant) {
    return res.status(400).json({ message: 'All items must belong to the same restaurant' });
  }

  const priceMap = new Map(menuItems.map((m) => [m.id, m.price]));
  const { subtotal, tax, total } = calculateTotals(items, priceMap, restaurant.deliveryFee);

  const order = await prisma.order.create({
    data: {
      userId: req.user!.id,
      restaurantId,
      addressId,
      deliveryNotes,
      paymentMethod,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      subtotal,
      tax,
      deliveryFee: restaurant.deliveryFee,
      total,
      items: {
        create: items.map((item: any) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: priceMap.get(item.menuItemId)!,
        })),
      },
    },
    include: { items: true, restaurant: true },
  });

  emitOrderEvent('order_created', order);
  emitOrderStatus(order);
  return res.status(201).json(order);
};

export const getUserOrders = async (req: AuthRequest, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true, restaurant: true, driver: true },
  });

  return res.json(orders);
};

export const getVendorOrders = async (req: AuthRequest, res: Response) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.id } });
  if (!vendor) return res.status(403).json({ message: 'Vendor profile not found' });

  const orders = await prisma.order.findMany({
    where: { restaurant: { vendorId: vendor.id } },
    orderBy: { createdAt: 'desc' },
    include: { items: true, restaurant: true, driver: true },
  });

  return res.json(orders);
};

export const getDriverOrders = async (req: AuthRequest, res: Response) => {
  const driver = await ensureDriverForUser(req.user!.id);
  if (!driver) return res.status(403).json({ message: 'Driver profile not found' });

  const orders = await prisma.order.findMany({
    where: { driverId: driver.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true, restaurant: true },
  });

  return res.json(orders);
};

export const listAvailableOrders = async (_req: AuthRequest, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { status: 'READY_FOR_PICKUP', driverId: null },
    orderBy: { createdAt: 'asc' },
    include: { items: true, restaurant: true },
  });

  return res.json(orders);
};

export const acceptOrder = async (req: AuthRequest, res: Response) => {
  const order = await ensureVendorOwnsOrder(req.params.id, req.user!.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.status !== 'PENDING') return res.status(400).json({ message: 'Only pending orders can be accepted' });

  const updated = await prisma.order.update({ where: { id: order.id }, data: { status: 'ACCEPTED' }, include: { items: true, restaurant: true } });
  emitOrderEvent('order_accepted', updated);
  emitOrderStatus(updated);
  return res.json(updated);
};

export const rejectOrder = async (req: AuthRequest, res: Response) => {
  const order = await ensureVendorOwnsOrder(req.params.id, req.user!.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.status !== 'PENDING') return res.status(400).json({ message: 'Only pending orders can be rejected' });

  const updated = await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' }, include: { items: true, restaurant: true } });
  emitOrderEvent('order_cancelled', updated);
  emitOrderStatus(updated);
  return res.json(updated);
};

export const markOrderReadyForPickup = async (req: AuthRequest, res: Response) => {
  const order = await ensureVendorOwnsOrder(req.params.id, req.user!.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (!['ACCEPTED', 'PREPARING'].includes(order.status)) {
    return res.status(400).json({ message: 'Order must be accepted before marking ready' });
  }

  let preparingOrder = order;
  if (order.status === 'ACCEPTED') {
    preparingOrder = await prisma.order.update({ where: { id: order.id }, data: { status: 'PREPARING' }, include: { items: true, restaurant: true } });
    emitOrderEvent('order_preparing', preparingOrder);
    emitOrderStatus(preparingOrder);
  }

  const readyOrder = await prisma.order.update({ where: { id: preparingOrder.id }, data: { status: 'READY_FOR_PICKUP' }, include: { items: true, restaurant: true } });
  emitOrderEvent('order_ready', readyOrder);
  emitOrderStatus(readyOrder);
  return res.json(readyOrder);
};

export const assignOrder = async (req: AuthRequest, res: Response) => {
  const driver = await ensureDriverForUser(req.user!.id);
  if (!driver) return res.status(403).json({ message: 'Driver profile not found' });

  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { restaurant: true, items: true } });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.status !== 'READY_FOR_PICKUP') {
    return res.status(400).json({ message: 'Order is not available for assignment' });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { driverId: driver.id, status: 'ASSIGNED' },
    include: { items: true, restaurant: true },
  });

  emitOrderEvent('driver_assigned', updated);
  emitOrderStatus(updated);
  return res.json(updated);
};

export const pickupOrder = async (req: AuthRequest, res: Response) => {
  const driver = await ensureDriverForUser(req.user!.id);
  if (!driver) return res.status(403).json({ message: 'Driver profile not found' });

  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true, restaurant: true } });
  if (!order || order.driverId !== driver.id) {
    return res.status(404).json({ message: 'Order not found or not assigned to driver' });
  }

  if (!['ASSIGNED', 'READY_FOR_PICKUP'].includes(order.status)) {
    return res.status(400).json({ message: 'Order is not ready for pickup' });
  }

  const pickedUp = await prisma.order.update({ where: { id: order.id }, data: { status: 'PICKED_UP' }, include: { items: true, restaurant: true } });
  emitOrderEvent('order_picked_up', pickedUp);
  emitOrderStatus(pickedUp);

  const enRoute = await prisma.order.update({ where: { id: order.id }, data: { status: 'ON_THE_WAY' }, include: { items: true, restaurant: true } });
  emitOrderEvent('order_on_the_way', enRoute);
  emitOrderStatus(enRoute);
  return res.json(enRoute);
};

export const deliverOrder = async (req: AuthRequest, res: Response) => {
  const driver = await ensureDriverForUser(req.user!.id);
  if (!driver) return res.status(403).json({ message: 'Driver profile not found' });

  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true, restaurant: true } });
  if (!order || order.driverId !== driver.id) {
    return res.status(404).json({ message: 'Order not found or not assigned to driver' });
  }

  if (!['ON_THE_WAY', 'PICKED_UP'].includes(order.status)) {
    return res.status(400).json({ message: 'Order is not en route' });
  }

  const updated = await prisma.order.update({ where: { id: order.id }, data: { status: 'DELIVERED' }, include: { items: true, restaurant: true } });
  emitOrderEvent('order_delivered', updated);
  emitOrderStatus(updated);
  return res.json(updated);
};

export const getOrderTracking = async (req: AuthRequest, res: Response) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      driver: { include: { user: true, driverLocation: true } },
      restaurant: { include: { address: true, vendor: { include: { user: true } } } },
      address: true,
    },
  });

  if (!order) return res.status(404).json({ message: 'Order not found' });

  const isCustomer = order.userId === req.user!.id;
  const isDriver = order.driver?.userId === req.user!.id;
  const isVendor = order.restaurant.vendor.userId === req.user!.id;

  if (!isCustomer && !isDriver && !isVendor) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  return res.json({
    orderId: order.id,
    status: order.status,
    driver: order.driver
      ? {
          id: order.driver.id,
          firstName: order.driver.user.name?.split(' ')[0] ?? order.driver.user.name,
          lastName: order.driver.user.name?.split(' ').slice(1).join(' ') ?? '',
        }
      : null,
    driverLocation: order.driver?.driverLocation
      ? { latitude: order.driver.driverLocation.latitude, longitude: order.driver.driverLocation.longitude }
      : null,
    restaurantLocation: order.restaurant.address
      ? { latitude: order.restaurant.address.latitude, longitude: order.restaurant.address.longitude }
      : null,
    deliveryAddress: order.address,
  });
};
