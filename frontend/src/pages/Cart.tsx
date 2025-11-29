import { Link } from 'react-router-dom';
import CartItem from '../components/CartItem';
import CheckoutButton from '../components/CheckoutButton';
import PriceSummary from '../components/PriceSummary';
import { useCartStore } from '../stores/cartStore';

export default function Cart() {
  const cartItems = useCartStore((state) => state.cartItems);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useCartStore((state) => state.subtotal());
  const tax = useCartStore((state) => state.tax());
  const deliveryFee = useCartStore((state) => state.deliveryFee());
  const total = useCartStore((state) => state.total());

  if (!cartItems.length) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
        <div className="text-6xl">🛒</div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">Your cart is empty</h2>
          <p className="text-sm text-gray-600">Add delicious meals and we'll have them ready in no time.</p>
        </div>
        <Link
          to="/"
          className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-600"
        >
          Browse restaurants
        </Link>
      </div>
    );
  }

  const restaurantLabel = cartItems[0]?.restaurantName;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.15em] text-rose-500">Cart</p>
          <h2 className="text-2xl font-bold text-gray-900">{restaurantLabel || 'Your items'}</h2>
        </div>
        <button className="text-sm font-semibold text-gray-500 hover:text-gray-700" onClick={clearCart}>
          Clear cart
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="space-y-3 lg:col-span-2">
          {cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onIncrease={increaseQuantity}
              onDecrease={decreaseQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>

        <div className="space-y-4">
          <PriceSummary subtotal={subtotal} tax={tax} deliveryFee={deliveryFee} total={total} />
          <CheckoutButton />
          <p className="text-xs text-gray-500">Taxes calculated at 8%. Delivery fee may vary by restaurant.</p>
        </div>
      </div>
    </div>
  );
}
