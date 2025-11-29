import { useEffect, useMemo, useState } from 'react';
import CategoryScroller from '../components/CategoryScroller';
import RestaurantCard from '../components/RestaurantCard';
import SearchBar from '../components/SearchBar';
import { useRestaurantStore } from '../stores/restaurantStore';

const FALLBACK_CATEGORIES = [
  'Pizza',
  'Burgers',
  'Sushi',
  'Indian',
  'Chinese',
  'Mexican',
  'Desserts',
  'Healthy',
  'Breakfast',
];

export default function Home() {
  const { restaurants, fetchRestaurants, loading, error } = useRestaurantStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const derivedCategories = useMemo(() => {
    const fromApi = restaurants
      .flatMap((restaurant) => restaurant.categories?.map((c) => c.name) || [])
      .filter(Boolean);

    const unique = Array.from(new Set([...fromApi, ...FALLBACK_CATEGORIES]));
    return unique.slice(0, 12);
  }, [restaurants]);

  const filtered = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    return restaurants.filter((restaurant) => {
      const matchesCategory = selectedCategory
        ? restaurant.categories?.some((c) => c.name === selectedCategory)
        : true;
      const matchesSearch = searchLower
        ? restaurant.name.toLowerCase().includes(searchLower) ||
          (restaurant.description || '').toLowerCase().includes(searchLower)
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [restaurants, search, selectedCategory]);

  const handleSearch = (query: string) => {
    setSearch(query);
    fetchRestaurants(query);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Discover nearby restaurants</h2>
          <p className="text-sm text-gray-600">Order from your favorites or try something new.</p>
        </div>
        <div className="w-full max-w-xl">
          <SearchBar initialQuery={search} onSearch={handleSearch} />
        </div>
      </div>

      <CategoryScroller
        categories={derivedCategories}
        selected={selectedCategory}
        onSelect={(category) => setSelectedCategory(category)}
      />

      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-64 animate-pulse rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <div className="h-36 w-full rounded-t-2xl bg-gray-200" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-1/2 rounded bg-gray-200" />
                <div className="h-3 w-2/3 rounded bg-gray-100" />
                <div className="h-3 w-1/3 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <div className="rounded-full bg-rose-50 p-3 text-rose-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No restaurants found</h3>
          <p className="text-sm text-gray-600">Try a different search or category to discover more options.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
}
