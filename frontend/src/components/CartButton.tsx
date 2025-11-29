import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';

export default function CartButton() {
  const navigate = useNavigate();
  const totalItems = useCartStore((state) => state.totalItems());
  const totalPrice = useCartStore((state) => state.totalPrice());

  if (totalItems === 0) return null;

  return (
    <button
      onClick={() => navigate('/cart')}
      className="fixed bottom-6 left-1/2 z-20 flex w-[90%] max-w-sm -translate-x-1/2 items-center justify-between rounded-full bg-rose-500 px-4 py-3 text-white shadow-xl transition hover:bg-rose-600 md:left-auto md:right-6 md:translate-x-0"
    >
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">{totalItems} items</span>
        <span className="text-sm font-semibold">View Cart</span>
      </div>
      <span className="text-sm font-bold">${totalPrice().toFixed(2)}</span>
    </button>
  );
}
