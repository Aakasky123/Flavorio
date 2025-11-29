import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import CartButton from '../components/CartButton';
import MenuItemCard from '../components/MenuItemCard';
import { useCartStore } from '../stores/cartStore';
import { useRestaurantStore } from '../stores/restaurantStore';

export default function RestaurantPage() {
  const { id } = useParams();
  const { addToCart } = useCartStore();
  const {
    restaurant,
    menuItems,
    loading,
    menuLoading,
    error,
    fetchRestaurant,
    fetchMenu,
  } = useRestaurantStore();
  const [cartError, setCartError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchRestaurant(id);
      fetchMenu(id);
    }
  }, [id, fetchMenu, fetchRestaurant]);

  const groupedMenu = useMemo(() => {
    if (!menuItems.length) return [] as { label: string; items: typeof menuItems }[];

    const groups: Record<string, typeof menuItems> = {};
    menuItems.forEach((item) => {
      const label = item.category?.name || 'All Items';
      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
    });

    return Object.entries(groups).map(([label, items]) => ({ label, items }));
  }, [menuItems]);

  const renderHeader = () => {
    if (loading) {
      return (
        <div className="animate-pulse space-y-3 rounded-2xl bg-white p-5 shadow">
          <div className="h-6 w-1/3 rounded bg-gray-200" />
          <div className="h-4 w-1/2 rounded bg-gray-200" />
          <div className="h-4 w-1/4 rounded bg-gray-200" />
        </div>
      );
    }

    if (!restaurant) return null;

    const primaryCategory = restaurant.categories?.[0]?.name;
    return (
      <div className="overflow-hidden rounded-2xl bg-white shadow">
        <div className="relative h-48 w-full bg-gray-100">
          {restaurant.imageUrl ? (
            <img src={restaurant.imageUrl} alt={restaurant.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50 text-2xl font-bold text-rose-500">
              {restaurant.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="space-y-2 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
              <p className="text-sm text-gray-600">
                {primaryCategory || 'Great food, fast delivery'} • {restaurant.deliveryTimeMinutes || 25} mins
              </p>
            </div>
            {restaurant.deliveryFee !== undefined && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                Delivery ${restaurant.deliveryFee.toFixed(2)}
              </span>
            )}
          </div>
          {restaurant.description && <p className="text-gray-700">{restaurant.description}</p>}
        </div>
      </div>
    );
  };

  const renderMenu = () => {
    if (menuLoading) {
      return (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="animate-pulse rounded-2xl bg-white p-4 shadow">
              <div className="mb-3 h-5 w-1/3 rounded bg-gray-200" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                  <div className="h-4 w-16 rounded bg-gray-200" />
                </div>
                <div className="h-4 w-2/3 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>;
    }

    if (!groupedMenu.length) {
      return <p className="text-center text-sm text-gray-500">No menu items available yet.</p>;
    }

    return (
      <div className="space-y-6">
              {groupedMenu.map((group) => (
                <section key={group.label} className="space-y-3">
                  <h2 className="text-xl font-semibold text-gray-900">{group.label}</h2>
                  <div className="space-y-3">
                    {group.items.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onAdd={() => {
                          try {
                            addToCart({
                              ...item,
                              quantity: 1,
                              image: item.imageUrl,
                              restaurantName: restaurant?.name,
                              deliveryFee: restaurant?.deliveryFee,
                            });
                            setCartError(null);
                          } catch (err: any) {
                            setCartError(err?.message || 'Unable to add item to cart.');
                          }
                        }}
                      />
                    ))}
                  </div>
                </section>
              ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-24">
      {renderHeader()}
      {cartError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{cartError}</div>}
      <div className="space-y-4">{renderMenu()}</div>
      <CartButton />
    </div>
  );
}
