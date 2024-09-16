import axios from "axios";
import { getCsrfToken } from "./csrf";

// Create a custom axios instance
export const userApi = axios.create({
  baseURL: "https://localhost:8080/api/user", // base URL for your backend API
  withCredentials: true, // Send cookies with requests (including JWT)
  headers: {
    "x-csrf-token": getCsrfToken(),
  },
});

export const itemApi = axios.create({
  baseURL: "https://localhost:8081/api/product", // base URL for your backend API
  withCredentials: true, // Send cookies with requests (including JWT)
  headers: {
    "x-csrf-token": getCsrfToken(),
  },
});

export const storeApi = axios.create({
  baseURL: "https://localhost:8082/api/store", // base URL for your backend API
  withCredentials: true, // Send cookies with requests (including JWT)
  headers: {
    "x-csrf-token": getCsrfToken(),
  },
});

export const orderApi = axios.create({
  baseURL: "https://localhost:8082/api/order/", // base URL for your backend API
  withCredentials: true, // Send cookies with requests (including JWT)
  headers: {
    "x-csrf-token": getCsrfToken(),
  },
});

export const paymentApi = axios.create({
  baseURL: "https://localhost:8083/api/payment", // base URL for your backend API
  withCredentials: true, // Send cookies with requests (including JWT)
  headers: {
    "x-csrf-token": getCsrfToken(),
  },
});
