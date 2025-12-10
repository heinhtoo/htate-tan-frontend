import { create } from "zustand";

interface LayoutState {
  isOpen: boolean;
  setOpen: ({ isOpen }: { isOpen: boolean }) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  isOpen: false,
  setOpen: ({ isOpen }) => set({ isOpen }),
}));
