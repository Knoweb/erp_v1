import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',  // Use relative URLs to leverage Vite proxy
  headers: {
    'Content-Type': 'application/json',
  },
});


// Add JWT token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Service Methods
export const subscriptionApi = {
  /**
   * Get all companies
   * GET /api/superadmin/subscriptions/companies
   */
  getCompanies: async () => {
    const response = await api.get('/api/superadmin/subscriptions/companies');
    return response.data;
  },

  /**
   * Block a company
   * PUT /api/superadmin/subscriptions/companies/${orgId}/block
   */
  blockCompany: async (orgId) => {
    const response = await api.put(`/api/superadmin/subscriptions/companies/${orgId}/block`);
    return response.data;
  },

  /**
   * Unblock a company
   * PUT /api/superadmin/subscriptions/companies/${orgId}/unblock
   */
  unblockCompany: async (orgId) => {
    const response = await api.put(`/api/superadmin/subscriptions/companies/${orgId}/unblock`);
    return response.data;
  },

  /**
   * Get all pending payments
   * GET /api/superadmin/subscriptions/payments/pending
   */
  getPendingPayments: async () => {
    const response = await api.get('/api/superadmin/subscriptions/payments/pending');
    return response.data;
  },

  /**
   * Approve a payment
   * POST /api/superadmin/subscriptions/payments/${paymentId}/approve
   */
  approvePayment: async (paymentId) => {
    const response = await api.post(`/api/superadmin/subscriptions/payments/${paymentId}/approve`);
    return response.data;
  },
};

export default api;
