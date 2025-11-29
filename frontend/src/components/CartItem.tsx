import { CartItem as CartItemType } from '../stores/cartStore';

interface Props {
  item: CartItemType;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({ item, onIncrease, onDecrease, onRemove }: Props) {
  return (
    <div className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="h-20 w-20 overflow-hidden rounded-xl bg-gray-100">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50 text-lg font-bold text-rose-500">
            {item.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
          </div>
          <button className="text-sm font-semibold text-red-500" onClick={() => onRemove(item.id)}>
            Remove
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full border bg-gray-50 px-3 py-1">
            <button
              className="text-lg font-semibold text-gray-600"
              onClick={() => onDecrease(item.id)}
              aria-label={`Decrease ${item.name}`}
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
            <button
              className="text-lg font-semibold text-gray-600"
              onClick={() => onIncrease(item.id)}
              aria-label={`Increase ${item.name}`}
            >
              +
            </button>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            ${(item.price * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
