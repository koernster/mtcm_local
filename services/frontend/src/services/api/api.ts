import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Helper function to handle API responses
const handleResponse = <T>(response: AxiosResponse<T>): ApiResponse<T> => ({
  data: response.data,
  status: response.status,
  message: response.statusText,
});

const createApiInstance = (baseURL: string, token: string | undefined): AxiosInstance => {
  const api = axios.create({
    baseURL,
    timeout: 10000, // 10 seconds timeout
  });

  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle errors
      const status = error.response?.status;
      if (status === 401) {
        // Handle unauthorized errors (e.g., redirect to login)
      }
      return Promise.reject(error);
    }
  );

  return api;
};

export { handleResponse, createApiInstance };