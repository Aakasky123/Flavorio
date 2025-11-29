import { Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../utils/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { stripe } from '../services/stripe.js';
import { env } from '../config/env.js';

const toCents = (amount: any) => Math.round(Number(amount) * 100);

export const createPaymentIntent = async (req: AuthRequest, res: Response) => {
  const { orderId, paymentMethodType = 'card' } = req.body as { orderId: string; paymentMethodType?: string };

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true } });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.userId !== req.user!.id) return res.status(403).json({ message: 'Not authorized to pay for this order' });
  if (order.paymentStatus === 'PAID') return res.status(400).json({ message: 'Order already paid' });

  const amountCents = toCents(order.total);

  let paymentIntent: Stripe.PaymentIntent;
  if (order.payment?.stripePaymentIntentId) {
    paymentIntent = await stripe.paymentIntents.retrieve(order.payment.stripePaymentIntentId);
    await prisma.payment.update({
      where: { id: order.payment.id },
      data: { status: 'PENDING', amount: order.total },
    });
  } else {
    paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      payment_method_types: [paymentMethodType],
      metadata: { orderId: order.id, userId: order.userId },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        userId: order.userId,
        stripePaymentIntentId: paymentIntent.id,
        amount: order.total,
        status: 'PENDING',
      },
    });
  }

  let paymentStatus = order.paymentStatus;
  if (paymentStatus !== 'PENDING') {
    await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'PENDING' } });
    paymentStatus = 'PENDING';
  }

  return res.status(201).json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    paymentStatus,
  });
};

export const getPaymentForOrder = async (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true } });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.userId !== req.user!.id) return res.status(403).json({ message: 'Not authorized' });
  if (!order.payment) return res.status(404).json({ message: 'Payment not initialized' });

  const paymentIntent = await stripe.paymentIntents.retrieve(order.payment.stripePaymentIntentId);

  return res.json({
    status: order.paymentStatus,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });
};

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'];
  if (!signature || !env.stripeWebhookSecret) {
    return res.status(400).send('Missing Stripe signature');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);
  } catch (err: any) {
    console.error('Stripe webhook validation failed', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const intent = event.data.object as Stripe.PaymentIntent;

  if (event.type === 'payment_intent.succeeded') {
    const payment = await prisma.payment.findUnique({ where: { stripePaymentIntentId: intent.id } });
    if (payment) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: 'PAID' } });
      await prisma.order.update({ where: { id: payment.orderId }, data: { paymentStatus: 'PAID' } });
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const payment = await prisma.payment.findUnique({ where: { stripePaymentIntentId: intent.id } });
    if (payment) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } });
      await prisma.order.update({ where: { id: payment.orderId }, data: { paymentStatus: 'FAILED' } });
    }
  }

  return res.json({ received: true });
};
