import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  image?: string;
  restaurantName?: string;
  deliveryFee?: number;
}

interface CartState {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
  hasMultipleRestaurants: () => boolean;
  restaurantId: () => string | null;
  restaurantName: () => string | undefined;
  subtotal: () => number;
  tax: () => number;
  deliveryFee: () => number;
  total: () => number;
  totalItems: () => number;
  // backward compatible selector used by CartButton
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartItems: [],
  addToCart: (item) =>
    set((state) => {
      if (state.cartItems.length && state.cartItems[0].restaurantId !== item.restaurantId) {
        throw new Error('You can only order from one restaurant at a time. Clear your cart to switch.');
      }

      const existing = state.cartItems.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return {
          cartItems: state.cartItems.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + (item.quantity ?? 1) }
              : cartItem,
          ),
        };
      }

      return {
        cartItems: [...state.cartItems, { ...item, quantity: item.quantity ?? 1 }],
      };
    }),
  increaseQuantity: (id) =>
    set((state) => ({
      cartItems: state.cartItems.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)),
    })),
  decreaseQuantity: (id) =>
    set((state) => ({
      cartItems: state.cartItems
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item))
        .filter((item) => item.quantity > 0),
    })),
  removeItem: (id) => set((state) => ({ cartItems: state.cartItems.filter((item) => item.id !== id) })),
  clearCart: () => set({ cartItems: [] }),
  hasMultipleRestaurants: () => {
    const ids = new Set(get().cartItems.map((item) => item.restaurantId));
    return ids.size > 1;
  },
  restaurantId: () => get().cartItems[0]?.restaurantId || null,
  restaurantName: () => get().cartItems[0]?.restaurantName,
  subtotal: () => get().cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
  tax: () => +(get().subtotal() * 0.08).toFixed(2),
  deliveryFee: () => {
    if (!get().cartItems.length) return 0;
    const fee = get().cartItems[0].deliveryFee;
    return fee !== undefined ? fee : 3.99;
  },
  total: () => +(get().subtotal() + get().tax() + get().deliveryFee()).toFixed(2),
  totalItems: () => get().cartItems.reduce((sum, item) => sum + item.quantity, 0),
  totalPrice: () => get().total(),
}));
