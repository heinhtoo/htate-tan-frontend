import axios from "axios";
import { useAuthStore } from "../store/authStore";

// Create an instance
const axiosClientInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND + "/api/rest/v1",
  withCredentials: true,
});

// Add an interceptor
axiosClientInstance.interceptors.request.use(
  async (config) => {
    const authState = useAuthStore.getState();
    const accessToken = authState.accessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      console.error("Axios Error:", error.response?.data || error.message);
      return Promise.reject(
        error.response?.data || {
          message: "An error occurred with the request",
        }
      );
    }
    console.error("Non-Axios Error: ", error);
    return Promise.reject({ message: "An unexpected error occurred" });
  }
);

axiosClientInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.status === 401) {
      const authState = useAuthStore.getState();
      authState.setAccessToken("");
    }
    // Re-throw other errors
    return Promise.reject(error);
  }
);

export default axiosClientInstance;
