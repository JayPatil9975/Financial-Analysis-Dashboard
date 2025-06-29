import axios from "axios";

const API = axios.create({
  baseURL: "https://financial-analysis-dashboard-p8is.onrender.com/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
