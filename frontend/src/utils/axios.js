import axios from "axios";
import { getCsrfToken } from "./csrf";

// Function to create Axios instances (both with and without CSRF token)
const createApis = (baseURLs) => {
  const apis = {};
  baseURLs.forEach(({ name, baseURL }) => {
    apis[`${name}Api`] = axios.create({
      baseURL,
      withCredentials: true,
      headers: { "x-csrf-token": getCsrfToken() },
    });
    apis[`${name}ApiNSCR`] = axios.create({
      baseURL,
      withCredentials: true,
    });
  });
  return apis;
};

// Define base URLs for different APIs
const baseURLs = [
  { name: "user", baseURL: "https://localhost:8080/api/user" },
  { name: "item", baseURL: "https://localhost:8081/api/product" },
  { name: "store", baseURL: "https://localhost:8082/api/store" },
  { name: "order", baseURL: "https://localhost:8082/api/order" },
  { name: "payment", baseURL: "https://localhost:8083/api/payment" },
];

// Create all APIs in one step
export const {
  userApi,
  userApiNSCR,
  itemApi,
  itemApiNSCR,
  storeApi,
  storeApiNSCR,
  orderApi,
  orderApiNSCR,
  paymentApi,
  paymentApiNSCR,
} = createApis(baseURLs);

// Function to update the CSRF token in all state-changing instances
export const updateAxiosCsrfToken = () => {
  [userApi, itemApi, storeApi, orderApi, paymentApi].forEach((api) => {
    api.defaults.headers["x-csrf-token"] = getCsrfToken();
  });
};

export const clearAxiosHeadersOnLogout = () => {
  // Remove CSRF token or other sensitive headers from all instances
  [userApi, itemApi, storeApi, orderApi, paymentApi].forEach((api) => {
    delete api.defaults.headers["x-csrf-token"];
  });
};

// below are the request for googleAPI
const googleApi = (accessToken) => {
  return axios.create({
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
};

// Helper function to make a GET request to Google API
export const getGoogleAPIResponse = (url, access_token) => {
  const api = googleApi(access_token);
  return api.get(url);
};
