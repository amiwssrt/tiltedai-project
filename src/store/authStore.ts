import { create } from "zustand";

interface AuthState {
  user: any;
  loading: boolean;
  setUser: (user: any) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
}));
