import { create } from 'zustand';
import axiosInstance from '../api/axios.js';

export const useCartStore = create((set, get) => ({
  items: [],
  cartCount: 0,
  cartTotal: '0.00',
  isLoading: false,

  setCart: (cart) => set({
    items: cart?.items || [],
    cartCount: cart?.totalItems || 0,
    cartTotal: cart?.totalAmount || '0.00'
  }),

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.get('/cart');
      const cart = response.data.data;
      set({
        items: cart.items || [],
        cartCount: cart.totalItems || 0,
        cartTotal: cart.totalAmount || '0.00',
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      // If unauthorized, silent fail is fine as guest has no cart
    }
  },

  clearCart: () => set({
    items: [],
    cartCount: 0,
    cartTotal: '0.00'
  })
}));
