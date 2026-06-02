import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserProfile, Address, UserRole } from "../types";
import { DEMO_USER, DEMO_ADMIN } from "../lib/mockData";
import { UserService } from "../services/api";

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  login: (role: UserRole) => Promise<UserProfile>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  addAddress: (address: Omit<Address, "id">) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      login: async (role: UserRole) => {
        set({ loading: true });
        // Simulating authentication matching the requirement
        const profile = role === "SUPER_ADMIN" ? DEMO_ADMIN : DEMO_USER;
        set({ user: { ...profile }, loading: false });
        return { ...profile };
      },
      logout: () => {
        set({ user: null });
      },
      updateProfile: async (updates: Partial<UserProfile>) => {
        const { user } = get();
        if (!user) return;
        set({ loading: true });
        const updated = await UserService.updateProfile(updates);
        set({ user: { ...user, ...updated }, loading: false });
      },
      addAddress: (addrData) => {
        const { user } = get();
        if (!user) return;
        const newAddress: Address = {
          ...addrData,
          id: `addr-${Date.now()}`,
          isDefault: user.addresses.length === 0 ? true : addrData.isDefault
        };

        let updatedAddresses = [...user.addresses];
        if (newAddress.isDefault) {
          updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
        }
        updatedAddresses.push(newAddress);

        set({ user: { ...user, addresses: updatedAddresses } });
      },
      deleteAddress: (id: string) => {
        const { user } = get();
        if (!user) return;
        const updatedAddresses = user.addresses.filter((a) => a.id !== id);
        // If we deleted the default, set first one as default if any left
        if (updatedAddresses.length > 0 && !updatedAddresses.some((a) => a.isDefault)) {
          updatedAddresses[0].isDefault = true;
        }
        set({ user: { ...user, addresses: updatedAddresses } });
      },
      setDefaultAddress: (id: string) => {
        const { user } = get();
        if (!user) return;
        const updatedAddresses = user.addresses.map((a) => ({
          ...a,
          isDefault: a.id === id
        }));
        set({ user: { ...user, addresses: updatedAddresses } });
      }
    }),
    {
      name: "solarshop-auth-storage"
    }
  )
);
