import { logoutUser } from "@/features/auth/auth.action";
import { create } from "zustand";

export type UserDetails = {
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  createdBy: string;
  updatedBy: string;
  id: string;
  username: string;
  isAdmin: boolean;
  warehouse: {
    version: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    createdBy: string;
    updatedBy: string;
    id: number;
    name: string;
    location: string;
    isSellable: boolean;
    orderLeadingTExt: string;
  };
};

interface AuthState {
  user: UserDetails | undefined;
  accessToken: string | null;
  notiToken: string | null;
  isProfileSheetOpen: boolean;
  setProfileSheetOpen: (isProfileSheetOpen: boolean) => void;
  setNotiToken: (token: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => Promise<void>;
  setUser: (user: UserDetails) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: undefined,
  accessToken: "",
  notiToken: "",
  isProfileSheetOpen: false,
  setProfileSheetOpen: (isProfileSheetOpen) => {
    set({ isProfileSheetOpen });
  },
  setNotiToken: (token) => {
    set({ notiToken: token });
  },
  setAccessToken: (token) => {
    set({ accessToken: token });
  },
  logout: async () => {
    const deviceId = localStorage.getItem("device_id");
    const lastNotiSeenAt = localStorage.getItem("last_noti_seen_at");
    if (deviceId) {
      await logoutUser({ deviceId, lastNotiSeenAt: lastNotiSeenAt ?? "" });
      set({ accessToken: "" });
    }
  },
  setUser: (user) => {
    set({ user });
  },
}));
