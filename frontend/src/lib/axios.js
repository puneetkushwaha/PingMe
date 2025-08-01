import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : "https://pingmee-b9bl.onrender.com/api",  // 👈 Correct baseURL for production
  withCredentials: true,
});
