import { create } from "zustand";

type ApiConfigState = {
  baseURL: string;
  setBaseURL: (url: string) => void;
};

export const useApiConfigStore = create<ApiConfigState>((set) => ({
  baseURL: localStorage.getItem("API_BASE_URL") || import.meta.env.VITE_BACKEND,
  setBaseURL: (baseURL) => {
    localStorage.setItem("API_BASE_URL", baseURL);
    set({ baseURL });
  },
}));
