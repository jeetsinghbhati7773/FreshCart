// utils/axiosInstance.js
import axios from "axios";

const baseURL = "https://hitman-grocery-backend.onrender.com/api";

// 👉 For regular users
export const userAxios = axios.create({ baseURL });

userAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 👉 For sellers
export const sellerAxios = axios.create({ baseURL });

sellerAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("sellerToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Default export (can keep as userAxios for backward compatibility)
export default userAxios;
