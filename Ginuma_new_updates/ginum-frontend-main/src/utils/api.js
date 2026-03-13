import axios from "axios";

// Export base API URL - Points to API Gateway via Nginx proxy OR Environment Variable
// Relative path "/ginuma-api" is preferred as it works on any server IP/domain
export const apiUrl = import.meta.env.VITE_API_URL || "/ginuma-api";

console.log("🚀 API Configuration Initialized:");
console.log("   - Base URL:", apiUrl);
console.log("   - Vite Env:", import.meta.env.VITE_API_URL || "NOT SET (Using default)");

// Create an Axios instance
const api = axios.create({
  baseURL: apiUrl,
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
