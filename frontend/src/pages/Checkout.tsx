import { Elements, CardElement, loadStripe, useElements, useStripe } from '@stripe/react-stripe-js';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddressForm, { AddressFormValues } from '../components/AddressForm';
import OrderSummary from '../components/OrderSummary';
import PaymentForm from '../components/PaymentForm';
import { confirmPayment, createAddress, createOrder, createPaymentIntent } from '../api';
import { useCartStore } from '../stores/cartStore';
import { useUserStore } from '../stores/userStore';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export default function Checkout() {
  const navigate = useNavigate();
  const {
    cartItems,
    subtotal,
    tax,
    deliveryFee,
    total,
    clearCart,
    restaurantId,
    restaurantName,
    hasMultipleRestaurants,
  } = useCartStore();
  const { accessToken } = useUserStore();

  const stripePromise = useMemo(() => (publishableKey ? loadStripe(publishableKey) : null), [publishableKey]);

  const [addressValues, setAddressValues] = useState<AddressFormValues>({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
  });
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!cartItems.length) {
      navigate('/');
    }
  }, [cartItems.length, navigate]);

  const handlePlaceOrder = async (
    stripe: ReturnType<typeof useStripe>,
    elements: ReturnType<typeof useElements>,
  ) => {
    if (!accessToken) {
      navigate('/auth');
      return;
    }

    if (!stripe || !elements) {
      setPaymentError('Payment is not ready yet. Please try again.');
      return;
    }

    if (!cartItems.length) {
      navigate('/');
      return;
    }

    if (hasMultipleRestaurants()) {
      setError('You can only checkout from one restaurant at a time.');
      return;
    }

    const restaurant = restaurantId();
    if (!restaurant) {
      setError('Restaurant information is missing.');
      return;
    }

    setProcessing(true);
    setError(null);
    setPaymentError(null);

    try {
      const savedAddress = await createAddress(addressValues, accessToken);
      const order = await createOrder(
        {
          restaurantId: restaurant,
          addressId: savedAddress.id,
          deliveryNotes: deliveryNotes || undefined,
          paymentMethod: 'CARD',
          items: cartItems.map((item) => ({ menuItemId: item.id, quantity: item.quantity })),
        },
        accessToken,
      );

      const { clientSecret } = await createPaymentIntent(order.id, 'card', accessToken);
      const cardElement = elements.getElement(CardElement);
      await confirmPayment(stripe, cardElement, clientSecret);

      clearCart();
      navigate(`/orders/${order.id}`);
    } catch (err: any) {
      const message = err?.message || 'Unable to complete checkout.';
      if (message.toLowerCase().includes('restaurant')) {
        setError(message);
      } else {
        setPaymentError(message);
      }
    } finally {
      setProcessing(false);
    }
  };

  if (!stripePromise) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        Missing Stripe publishable key. Add VITE_STRIPE_PUBLISHABLE_KEY to your environment.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <AddressForm
            values={addressValues}
            onChange={(field, value) => setAddressValues((prev) => ({ ...prev, [field]: value }))}
            disabled={processing}
          />
          <div className="rounded-2xl bg-white p-5 shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Delivery Notes</h3>
              <span className="text-xs text-gray-500">Optional</span>
            </div>
            <textarea
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
              placeholder="Add instructions for your driver"
              rows={3}
              disabled={processing}
            />
          </div>
          <PaymentForm
            onSubmit={handlePlaceOrder}
            disabled={processing || hasMultipleRestaurants()}
            error={paymentError || error}
            processing={processing}
          />
        </div>
        <div className="space-y-4">
          <OrderSummary
            items={cartItems}
            subtotal={subtotal()}
            tax={tax()}
            deliveryFee={deliveryFee()}
            total={total()}
            restaurantName={restaurantName()}
          />
          {hasMultipleRestaurants() && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              You can only checkout items from one restaurant at a time.
            </div>
          )}
        </div>
      </div>
    </Elements>
  );
}
