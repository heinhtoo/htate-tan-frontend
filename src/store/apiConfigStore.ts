import { create } from "zustand";

type ApiConfigState = {
  baseURL: string;
  setBaseURL: (url: string) => void;
};

const getInitialBaseURL = () => {
  const stored = localStorage.getItem("API_BASE_URL");
  if (stored) return stored;

  const backendUrl = import.meta.env.VITE_BACKEND || "http://localhost:3000";
  try {
    const url = new URL(backendUrl);
    // If backend is localhost but frontend is not, point backend to frontend's host
    if (
      (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      url.hostname = window.location.hostname;
    }
    return url.origin;
  } catch (e) {
    return backendUrl;
  }
};

export const useApiConfigStore = create<ApiConfigState>((set) => ({
  baseURL: getInitialBaseURL(),
  setBaseURL: (baseURL) => {
    localStorage.setItem("API_BASE_URL", baseURL);
    set({ baseURL });
  },
}));
