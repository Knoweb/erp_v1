import axios from "axios";

// Export base API URL - Points to API Gateway (from .env or production server)
export const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  console.warn("⚠️ VITE_API_URL is not defined! Falling back to localhost:8080. Check your .env files.");
}

// Create an Axios instance
const api = axios.create({
  baseURL: apiUrl || "http://localhost:8080",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor - Attach JWT token from sessionStorage OR localStorage
api.interceptors.request.use(
  (config) => {
    // Try multiple token storage locations (SSO stores in both places)
    const token =
      localStorage.getItem("auth_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("ginuma_token") ||
      sessionStorage.getItem("auth_token"); // Check session storage as well

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle 401/403 errors and redirect to login
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;

      // Handle authentication/authorization errors
      if (status === 401 || status === 403) {
        console.error(`🔒 ${status} Error: Authentication failed. Clearing tokens and redirecting to login...`);

        // Clear ALL storage (both sessionStorage and localStorage)
        sessionStorage.clear();
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');
        localStorage.removeItem('ginuma_token');
        localStorage.removeItem('ginuma_refreshToken');
        localStorage.removeItem('ginuma_userId');
        localStorage.removeItem('ginuma_orgId');
        localStorage.removeItem('userId');
        localStorage.removeItem('orgId');

        // Redirect to SSO login route
        window.location.href = "/account/sso-login";
      } else if (status === 500) {
        console.error("Server error:", error.response.data.message);
      }
    } else if (error.message.includes("timeout")) {
      console.error("Request timed out. Please try again.");
    } else {
      console.error("Network error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
