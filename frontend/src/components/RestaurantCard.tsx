import { Link } from 'react-router-dom';
import { Restaurant } from '../stores/restaurantStore';

interface Props {
  restaurant: Restaurant;
}

const formatDelivery = (minutes?: number | null) => {
  if (!minutes) return '20-40 min';
  const low = Math.max(10, Math.round(minutes * 0.8));
  const high = Math.round(minutes * 1.2);
  return `${low}-${high} min`;
};

export default function RestaurantCard({ restaurant }: Props) {
  const primaryCategory = restaurant.categories?.[0]?.name;
  const ratingLabel =
    restaurant.rating !== undefined && restaurant.ratingCount !== undefined
      ? `${restaurant.rating.toFixed(1)} • ${restaurant.ratingCount} ratings`
      : 'New';

  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-40 w-full overflow-hidden bg-gray-100">
        {restaurant.imageUrl ? (
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50 text-sm font-semibold text-rose-500">
            {restaurant.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-600">
            {formatDelivery(restaurant.deliveryTimeMinutes)}
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-gray-600">
          {restaurant.description || primaryCategory || 'Tasty bites near you'}
        </p>
        <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1 font-semibold text-amber-600">{ratingLabel}</span>
          {primaryCategory && <span className="rounded-full bg-gray-100 px-2 py-1">{primaryCategory}</span>}
        </div>
      </div>
    </Link>
  );
}
