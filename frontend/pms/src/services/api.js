import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Optional: redirect user to login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Provider Auth APIs
export const authAPI = {
  login: async ({ credential, password, remember }) => {
    try {
      const response = await api.post('/provider/login', {
        identifier: credential,
        password,
        remember_me: remember,
      });

      const result = response.data;
      const token = result?.data?.access_token;
      if (result.success && token) {
        localStorage.setItem('token', token);
      }
      return result;
    } catch (error) {
      if (error.response?.status === 429) {
        throw {
          message: 'Too many attempts. Please try again later.',
          isRateLimited: true,
          retryAfter: error.response.headers['retry-after'],
        };
      }
      throw {
        message: error.response?.data?.message || 'Login failed.',
        errors: error.response?.data?.errors || {},
      };
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Error sending reset email'
      );
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Error resetting password'
      );
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Registration failed'
      );
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
};

// Provider APIs
export const providerAPI = {
  getProfile: async () => {
    try {
      const response = await api.get('/provider/profile');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Error fetching profile'
      );
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/provider/profile', profileData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Error updating profile'
      );
    }
  },

  createAppointmentSlot: async (slotData) => {
    try {
      const response = await api.post('/appointment-slots', slotData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Error creating slot'
      );
    }
  },

  getAppointments: async () => {
    try {
      const response = await api.get('/provider/appointments');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Error fetching appointments'
      );
    }
  },
};

// Patient Auth APIs
export const patientAuthAPI = {
  login: async ({ identifier, password }) => {
    try {
      const response = await api.post('/patient/login', {
        identifier,
        password,
      });

      const token = response.data?.data?.access_token;
      if (response.data.success && token) {
        localStorage.setItem('token', token);
      }

      return response.data;
    } catch (error) {
      throw {
        message: error.response?.data?.message || 'Login failed.',
        errors: error.response?.data?.errors || {},
      };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/patient/login';
  },

  getProfile: async () => {
    try {
      const response = await api.get('/patient/profile');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Error fetching profile'
      );
    }
  },
};

export default api;
