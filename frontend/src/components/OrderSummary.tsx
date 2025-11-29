import { CartItem } from '../stores/cartStore';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  restaurantName?: string;
}

export default function OrderSummary({ items, subtotal, tax, deliveryFee, total, restaurantName }: OrderSummaryProps) {
  return (
    <div className="space-y-4 rounded-2xl bg-white p-5 shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
        {restaurantName && <span className="text-sm text-gray-500">{restaurantName}</span>}
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2 border-t border-dashed pt-3 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery Fee</span>
          <span>${deliveryFee.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between border-t pt-2 text-base font-semibold text-gray-900">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
