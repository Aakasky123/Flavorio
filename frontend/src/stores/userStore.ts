import axios from 'axios';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'CUSTOMER' | 'VENDOR' | 'DRIVER' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role?: UserRole;
}

interface UserState {
  accessToken: string | null;
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  resetError: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      loading: false,
      error: null,
      resetError: () => set({ error: null }),
      logout: () => set({ accessToken: null, user: null, error: null, loading: false }),
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await axios.post(
            `${API_URL}/auth/login`,
            { email, password },
            { withCredentials: true },
          );

          set({ accessToken: data.accessToken, user: data.user, loading: false });
        } catch (error: any) {
          const message = error?.response?.data?.message || 'Unable to login. Please try again.';
          set({ error: message, loading: false, accessToken: null, user: null });
          throw new Error(message);
        }
      },
      register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await axios.post(
            `${API_URL}/auth/register`,
            { name, email, password, role: 'CUSTOMER' },
            { withCredentials: true },
          );

          set({ accessToken: data.accessToken, user: data.user, loading: false });
        } catch (error: any) {
          const message = error?.response?.data?.message || 'Unable to register. Please try again.';
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },
      fetchCurrentUser: async () => {
        const token = get().accessToken;
        if (!token) return;

        set({ loading: true, error: null });
        try {
          const { data } = await axios.get(`${API_URL}/auth/me`, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          });

          set({ user: data.user, loading: false });
        } catch (error: any) {
          set({ loading: false, accessToken: null, user: null });
        }
      },
    }),
    {
      name: 'flavorio-user',
      partialize: (state) => ({ accessToken: state.accessToken, user: state.user }),
    },
  ),
);
