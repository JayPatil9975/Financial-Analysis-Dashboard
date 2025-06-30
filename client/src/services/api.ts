import axios from "axios";

// Use environment variable for baseURL, fallback to production URL
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, 
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
