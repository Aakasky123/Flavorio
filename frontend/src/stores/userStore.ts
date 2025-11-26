import { create } from 'zustand';

export type UserRole = 'CUSTOMER' | 'VENDOR' | 'DRIVER' | 'ADMIN';

interface UserState {
  token: string | null;
  profile: { id: string; email: string; name?: string; role?: UserRole } | null;
  setToken: (token: string | null) => void;
  setProfile: (profile: UserState['profile']) => void;
}

export const useUserStore = create<UserState>((set) => ({
  token: null,
  profile: null,
  setToken: (token) => set({ token }),
  setProfile: (profile) => set({ profile }),
}));
