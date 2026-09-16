import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,

      setCredentials: (user, token) => set({
        user,
        token,
        role: user ? user.role : null,
        isAuthenticated: !!token
      }),

      updateUser: (updatedUser) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedUser } : null,
        role: updatedUser.role || state.role
      })),

      logout: () => set({
        user: null,
        token: null,
        role: null,
        isAuthenticated: false
      })
    }),
    {
      name: 'sparkit-auth-storage' // key in localStorage
    }
  )
);
