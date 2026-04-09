import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/store/auth.store";

/**
 * API Client Configuration
 * - Enforces HTTPS for production and non-local development
 * - Manages JWT token-based authentication
 * - Prevents password leakage through request/response logging
 */

// Resolve API base URL and enforce HTTPS outside local development
const API_BASE_URL = (() => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(envUrl);
  const usesHttps = envUrl.startsWith("https://");

  if (typeof window !== "undefined") {
    const pageIsHttps = window.location.protocol === "https:";
    // Block insecure API calls when the app itself is served over HTTPS
    if (pageIsHttps && !usesHttps && !isLocal) {
      throw new Error(
        "API_BASE_URL must use HTTPS when the site is served over HTTPS. Set VITE_API_BASE_URL to an https URL."
      );
    }
  }

  // Warn during development if a non-HTTPS, non-local API URL is configured
  if (!usesHttps && !isLocal) {
    console.warn(
      "⚠️ API_BASE_URL should use HTTPS for production traffic. Current: " +
        envUrl
    );
  }

  return envUrl;
})();

// Create axios instance with security headers
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    // Prevent XSS attacks
    "X-Content-Type-Options": "nosniff",
  },
  // Prevent CSRF attacks
  withCredentials: true,
  timeout: 30000,
});

/**
 * Request interceptor to add JWT auth token
 * - Adds Bearer token from localStorage to Authorization header
 * - NEVER logs or stores passwords
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("authToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling and token refresh
 * - Handles 401 Unauthorized errors
 * - Clears auth state and redirects to login on token expiration
 * - Never logs sensitive data
 */
let isHandlingUnauthorized = false;

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const requestUrl =
        (error.config as InternalAxiosRequestConfig | undefined)?.url || "";

      // Let login/signup failures surface to the UI without redirect loops
      const isAuthEndpoint =
        requestUrl.includes("/auth/student/login") ||
        requestUrl.includes("/auth/manager/login") ||
        requestUrl.includes("/auth/student/signup");

      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      // Clear all persisted auth state once to avoid redirect loops
      if (!isHandlingUnauthorized) {
        isHandlingUnauthorized = true;
        useAuthStore.getState().logout();
        // Force navigation to login
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
