import Stripe from 'stripe';
import { env } from '../config/env.js';

if (!env.stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not configured');
}

export const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: '2023-10-16',
});
