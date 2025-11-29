import { MenuItem } from '../stores/restaurantStore';

interface Props {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export default function MenuItemCard({ item, onAdd }: Props) {
  return (
    <div className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-rose-500">{item.category?.name}</p>
            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
          </div>
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
            ${item.price.toFixed(2)}
          </span>
        </div>
        {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
        <button
          onClick={() => onAdd(item)}
          className="rounded-lg bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          Add to Cart
        </button>
      </div>
      <div className="h-24 w-24 overflow-hidden rounded-xl bg-gray-100">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50 text-sm font-semibold text-rose-500">
            {item.name.charAt(0)}
          </div>
        )}
      </div>
    </div>
  );
}
