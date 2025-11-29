interface Props {
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
}

export default function PriceSummary({ subtotal, tax, deliveryFee, total }: Props) {
  return (
    <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Price Summary</h3>
      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Tax</span>
          <span className="font-semibold text-gray-900">${tax.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Delivery Fee</span>
          <span className="font-semibold text-gray-900">${deliveryFee.toFixed(2)}</span>
        </div>
      </div>
      <div className="flex items-center justify-between border-t pt-3 text-base font-bold text-gray-900">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
}
