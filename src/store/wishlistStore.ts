import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  items: string[]; // List of product IDs
  addToWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  mergeWishlists: (ids: string[]) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addToWishlist: (id) => {
        const { items } = get();
        if (!items.includes(id)) {
          set({ items: [...items, id] });
        }
      },
      removeFromWishlist: (id) => {
        const { items } = get();
        set({ items: items.filter((item) => item !== id) });
      },
      toggleWishlist: (id) => {
        const { items, addToWishlist, removeFromWishlist } = get();
        if (items.includes(id)) {
          removeFromWishlist(id);
        } else {
          addToWishlist(id);
        }
      },
      isInWishlist: (id) => {
        return get().items.includes(id);
      },
      clearWishlist: () => {
        set({ items: [] });
      },
      mergeWishlists: (ids) => {
        const { items } = get();
        const merged = Array.from(new Set([...items, ...ids]));
        set({ items: merged });
      }
    }),
    {
      name: "solarshop-wishlist-storage"
    }
  )
);
