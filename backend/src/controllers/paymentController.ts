import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const createPayment = async (req: Request, res: Response) => {
  const payment = await prisma.payment.create({ data: req.body });
  return res.status(201).json(payment);
};

export const listPayments = async (_req: Request, res: Response) => {
  const payments = await prisma.payment.findMany();
  return res.json(payments);
};
