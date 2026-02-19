// axios.js
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : `${import.meta.env.VITE_API_BASE_URL}/api`,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Basic safety check for response
    if (!error.response) {
      console.error("Network or server error:", error);
    }
    return Promise.reject(error);
  }
);
