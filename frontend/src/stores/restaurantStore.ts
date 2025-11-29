import axios from 'axios';
import { create } from 'zustand';

export interface RestaurantCategory {
  id: string;
  name: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  rating?: number;
  ratingCount?: number;
  deliveryFee?: number;
  deliveryTimeMinutes?: number | null;
  categories?: RestaurantCategory[];
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable?: boolean;
  restaurantId: string;
  category?: RestaurantCategory | null;
}

interface RestaurantState {
  restaurants: Restaurant[];
  restaurant: Restaurant | null;
  menuItems: MenuItem[];
  loading: boolean;
  menuLoading: boolean;
  error: string | null;
  fetchRestaurants: (search?: string) => Promise<void>;
  fetchRestaurant: (id: string) => Promise<void>;
  fetchMenu: (restaurantId: string) => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const useRestaurantStore = create<RestaurantState>((set) => ({
  restaurants: [],
  restaurant: null,
  menuItems: [],
  loading: false,
  menuLoading: false,
  error: null,
  fetchRestaurants: async (search) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.get(`${API_URL}/restaurants`, {
        params: search ? { search } : undefined,
      });
      set({ restaurants: data, loading: false });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to load restaurants.';
      set({ error: message, loading: false, restaurants: [] });
    }
  },
  fetchRestaurant: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.get(`${API_URL}/restaurants/${id}`);
      set({ restaurant: data, loading: false });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to load restaurant.';
      set({ error: message, loading: false, restaurant: null });
    }
  },
  fetchMenu: async (restaurantId: string) => {
    set({ menuLoading: true, error: null });
    try {
      const { data } = await axios.get(`${API_URL}/restaurants/${restaurantId}/menu`);
      set({ menuItems: data, menuLoading: false });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to load menu items.';
      set({ error: message, menuLoading: false, menuItems: [] });
    }
  },
}));
