import { Link } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';

export default function Cart() {
  const { items, updateQuantity, removeItem, total } = useCartStore();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Cart</h2>
      {items.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded border bg-white p-3 shadow-sm">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  className="w-16 rounded border px-2 py-1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                />
                <button className="text-sm text-red-500" onClick={() => removeItem(item.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between rounded bg-white p-3 font-semibold shadow">
            <span>Total</span>
            <span>${total().toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="inline-block rounded bg-rose-500 px-4 py-2 text-white hover:bg-rose-600">
            Proceed to Checkout
          </Link>
        </div>
      )}
    </div>
  );
}
