import { useParams } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';

const menu = [
  { id: 'm1', name: 'California Roll', price: 12, restaurantId: '1' },
  { id: 'm2', name: 'Dragon Roll', price: 16, restaurantId: '1' },
];

export default function RestaurantPage() {
  const { id } = useParams();
  const { addItem } = useCartStore();

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-white p-4 shadow">
        <h2 className="text-2xl font-semibold">Restaurant {id}</h2>
        <p className="text-gray-600">Hand-picked menu items with real-time availability.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {menu
          .filter((item) => item.restaurantId === id)
          .map((item) => (
            <div key={item.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                </div>
                <button
                  className="rounded bg-rose-500 px-3 py-1 text-sm text-white hover:bg-rose-600"
                  onClick={() => addItem({ ...item, quantity: 1 })}
                >
                  Add
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
