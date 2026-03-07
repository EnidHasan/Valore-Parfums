"use client";

import { create } from "zustand";

export interface CartItem {
  perfumeId: string;
  perfumeName: string;
  ml: number;
  quantity: number;
  unitPrice: number;
  image?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (perfumeId: string, ml: number) => void;
  updateQuantity: (perfumeId: string, ml: number, quantity: number) => void;
  clearCart: () => void;
  subtotal: () => number;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) => {
    set((state) => {
      const existing = state.items.find(
        (i) => i.perfumeId === item.perfumeId && i.ml === item.ml
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.perfumeId === item.perfumeId && i.ml === item.ml
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, item] };
    });
  },

  removeItem: (perfumeId, ml) => {
    set((state) => ({
      items: state.items.filter(
        (i) => !(i.perfumeId === perfumeId && i.ml === ml)
      ),
    }));
  },

  updateQuantity: (perfumeId, ml, quantity) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.perfumeId === perfumeId && i.ml === ml ? { ...i, quantity } : i
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  subtotal: () => {
    return get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  },
}));
