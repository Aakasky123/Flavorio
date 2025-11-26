import { useCartStore } from '../stores/cartStore';

export default function Checkout() {
  const { total } = useCartStore();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Checkout</h2>
      <div className="rounded bg-white p-4 shadow">
        <p className="text-sm text-gray-600">Simulated checkout flow with Stripe integration.</p>
        <p className="mt-2 font-semibold">Payable amount: ${total().toFixed(2)}</p>
        <button className="mt-4 rounded bg-rose-500 px-4 py-2 text-white hover:bg-rose-600">
          Pay with Stripe
        </button>
      </div>
    </div>
  );
}
