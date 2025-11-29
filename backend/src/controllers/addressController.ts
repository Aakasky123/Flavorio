import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';

export const createAddress = async (req: AuthRequest, res: Response) => {
  const { name, street, city, state, zip, phone, label } = req.body;

  const address = await prisma.address.create({
    data: {
      contactName: name,
      phone,
      addressLine1: street,
      city,
      state,
      postalCode: zip,
      label,
      userId: req.user!.id,
    },
  });

  return res.status(201).json(address);
};

export const listAddresses = async (req: AuthRequest, res: Response) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });

  return res.json(addresses);
};

export const getAddress = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== req.user!.id) {
    return res.status(404).json({ message: 'Address not found' });
  }

  return res.json(address);
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== req.user!.id) {
    return res.status(404).json({ message: 'Address not found' });
  }

  await prisma.address.delete({ where: { id } });
  return res.status(204).send();
};
