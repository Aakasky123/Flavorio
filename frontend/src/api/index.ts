import axios from 'axios';
import { Stripe, StripeCardElement } from '@stripe/stripe-js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export interface AddressPayload {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

export const createAddress = async (payload: AddressPayload, token: string) => {
  const { data } = await api.post('/addresses', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export interface OrderPayload {
  restaurantId: string;
  addressId: string;
  deliveryNotes?: string;
  paymentMethod: string;
  items: { menuItemId: string; quantity: number }[];
}

export const createOrder = async (payload: OrderPayload, token: string) => {
  const { data } = await api.post('/orders', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createPaymentIntent = async (orderId: string, paymentMethodType: string, token: string) => {
  const { data } = await api.post(
    '/payments/create-intent',
    { orderId, paymentMethodType },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return data as { clientSecret: string };
};

export const confirmPayment = async (
  stripe: Stripe | null,
  cardElement: StripeCardElement | null,
  clientSecret: string,
) => {
  if (!stripe || !cardElement) {
    throw new Error('Payment is not ready.');
  }

  const result = await stripe.confirmCardPayment(clientSecret, {
    payment_method: { card: cardElement },
  });

  if (result.error) {
    throw new Error(result.error.message || 'Payment failed.');
  }

  if (result.paymentIntent?.status !== 'succeeded') {
    throw new Error('Payment was not completed.');
  }

  return result.paymentIntent;
};
