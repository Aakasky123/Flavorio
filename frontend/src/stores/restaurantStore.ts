import { create } from 'zustand';

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

interface RestaurantState {
  restaurants: Restaurant[];
  setRestaurants: (restaurants: Restaurant[]) => void;
}

export const useRestaurantStore = create<RestaurantState>((set) => ({
  restaurants: [],
  setRestaurants: (restaurants) => set({ restaurants }),
}));
