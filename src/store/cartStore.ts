import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "../types";

interface CartState {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "deliveryFee">) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleInstallation: (productId: string, enabled: boolean) => void;
  togglePickup: (productId: string, pickup: boolean) => void;
  updateDeliveryFee: (productId: string, fee: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  mergeCarts: (ids: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (newItem) => {
        const { items } = get();
        const existingIdx = items.findIndex((item) => item.productId === newItem.productId);
        
        if (existingIdx !== -1) {
          const updatedItems = [...items];
          updatedItems[existingIdx].quantity += newItem.quantity;
          // Retain newest preferences or merge
          updatedItems[existingIdx].installationSelected = newItem.installationSelected;
          updatedItems[existingIdx].pickupOption = newItem.pickupOption;
          set({ items: updatedItems });
        } else {
          set({ items: [...items, { ...newItem, deliveryFee: newItem.pickupOption ? 0 : 5000 }] });
        }
      },
      updateQuantity: (productId, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
          set({ items: items.filter((item) => item.productId !== productId) });
        } else {
          set({
            items: items.map((item) =>
              item.productId === productId ? { ...item, quantity } : item
            )
          });
        }
      },
      toggleInstallation: (productId, enabled) => {
        const { items } = get();
        set({
          items: items.map((item) =>
            item.productId === productId ? { ...item, installationSelected: enabled } : item
          )
        });
      },
      togglePickup: (productId, pickup) => {
        const { items } = get();
        set({
          items: items.map((item) =>
            item.productId === productId
              ? { ...item, pickupOption: pickup, deliveryFee: pickup ? 0 : 5000 }
              : item
          )
        });
      },
      updateDeliveryFee: (productId, fee) => {
        const { items } = get();
        set({
          items: items.map((item) =>
            item.productId === productId ? { ...item, deliveryFee: fee } : item
          )
        });
      },
      removeItem: (productId) => {
        const { items } = get();
        set({ items: items.filter((item) => item.productId !== productId) });
      },
      clearCart: () => {
        set({ items: [] });
      },
      mergeCarts: (incomingItems) => {
        const { items } = get();
        const merged = [...items];
        
        incomingItems.forEach((incoming) => {
          const idx = merged.findIndex((i) => i.productId === incoming.productId);
          if (idx !== -1) {
            merged[idx].quantity = Math.max(merged[idx].quantity, incoming.quantity);
          } else {
            merged.push(incoming);
          }
        });
        
        set({ items: merged });
      }
    }),
    {
      name: "solarshop-cart-storage"
    }
  )
);
