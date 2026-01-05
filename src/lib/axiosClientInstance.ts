import { useApiConfigStore } from "@/store/apiConfigStore";
import axios from "axios";
import { useAuthStore } from "../store/authStore";

// Create an instance
const axiosClientInstance = axios.create({
  withCredentials: true,
});

axiosClientInstance.interceptors.request.use(
  (config) => {
    // Dynamically override baseURL
    const { baseURL } = useApiConfigStore.getState();
    config.baseURL = baseURL + "/api/rest/v1";
    console.log(config.baseURL);
    // Set Authorization if accessToken exists
    const authState = useAuthStore.getState();
    if (authState.accessToken) {
      config.headers.Authorization = `Bearer ${authState.accessToken}`;
    }

    return config;
  },
  (error) => {
    // Handle request errors
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

// Response interceptor
axiosClientInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Correct check for 401
    if (error.response?.status === 401) {
      const authState = useAuthStore.getState();
      authState.setAccessToken("");
    }

    return Promise.reject(error);
  }
);

export default axiosClientInstance;
