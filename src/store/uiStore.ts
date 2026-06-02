import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  cartDrawerOpen: boolean;
  searchOpen: boolean;
  recentSearches: string[];
  setCartDrawerOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      cartDrawerOpen: false,
      searchOpen: false,
      recentSearches: ["400W panels", "LFP Storage", "Smart Inverters"],
      setCartDrawerOpen: (open) => set({ cartDrawerOpen: open }),
      setSearchOpen: (open) => set({ searchOpen: open }),
      addRecentSearch: (query) => {
        if (!query.trim()) return;
        const current = get().recentSearches.filter((s) => s !== query);
        set({ recentSearches: [query, ...current].slice(0, 5) });
      },
      clearRecentSearches: () => set({ recentSearches: [] })
    }),
    {
      name: "solarshop-ui-storage",
      partialize: (state) => ({ recentSearches: state.recentSearches })
    }
  )
);
