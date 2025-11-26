import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRestaurantStore } from '../stores/restaurantStore';

const mockRestaurants = [
  { id: '1', name: 'Sushi Place', description: 'Fresh sushi and rolls', imageUrl: 'https://via.placeholder.com/400x200' },
  { id: '2', name: 'Burger Joint', description: 'Smash burgers and fries', imageUrl: 'https://via.placeholder.com/400x200' },
];

export default function Home() {
  const { restaurants, setRestaurants } = useRestaurantStore();

  useEffect(() => {
    setRestaurants(mockRestaurants);
  }, [setRestaurants]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Nearby Restaurants</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {restaurants.map((restaurant) => (
          <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`} className="rounded-lg border bg-white shadow-sm">
            {restaurant.imageUrl && (
              <img src={restaurant.imageUrl} alt={restaurant.name} className="h-40 w-full rounded-t-lg object-cover" />
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold">{restaurant.name}</h3>
              <p className="text-sm text-gray-600">{restaurant.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
