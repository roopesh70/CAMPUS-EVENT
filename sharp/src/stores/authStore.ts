import { create } from 'zustand';
import type { User } from 'firebase/auth';
import type { UserProfile } from '@/types';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  role: UserProfile['role'] | 'public';
  setUser: (user: User) => void;
  setProfile: (profile: UserProfile) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  isAuthenticated: false,
  role: 'public',

  setUser: (user) =>
    set({ user, isAuthenticated: true }),

  setProfile: (profile) =>
    set({ profile, role: profile.role }),

  setLoading: (loading) =>
    set({ loading }),

  clearAuth: () =>
    set({
      user: null,
      profile: null,
      isAuthenticated: false,
      role: 'public',
      loading: false,
    }),
}));
