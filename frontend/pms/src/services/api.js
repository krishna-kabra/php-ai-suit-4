import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach token to each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('token');
      // Redirect to login if needed
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --------- Provider Auth ---------
export const authAPI = {
  login: async ({ credential, password, remember }) => {
    try {
      const response = await api.post('/provider/login', {
        identifier: credential,
        password,
        remember_me: remember,
      });

      const token = response.data?.data?.access_token;
      if (response.data.success && token) {
        localStorage.setItem('token', token);
      }

      return response.data;
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

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/provider/login';
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

// --------- Provider APIs ---------
export const providerAPI = {
  getProfile: async () => {
    const response = await api.get('/provider/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/provider/profile', data);
    return response.data;
  },

  createAppointmentSlot: async (data) => {
    const response = await api.post('/appointment-slots', data);
    return response.data;
  },

  getAvailabilities: async () => {
    const response = await api.get('/provider/availability');
    return response.data;
  },

  createAvailability: async (data) => {
    const response = await api.post('/provider/availability', data);
    return response.data;
  },

  updateAvailability: async (id, data) => {
    const response = await api.put(`/provider/availability/${id}`, data);
    return response.data;
  },

  deleteAvailability: async (id) => {
    const response = await api.delete(`/provider/availability/${id}`);
    return response.data;
  },

  getAvailableSlots: async (date) => {
    const response = await api.get(`/provider/available-slots?date=${date}`);
    return response.data;
  },

  getAppointments: async () => {
    const response = await api.get('/provider/appointments');
    return response.data;
  },

  completeAppointment: async (appointmentId, evaluationData) => {
    const response = await api.post(`/provider/appointments/${appointmentId}/complete`, evaluationData);
    return response.data;
  },
};

// --------- Patient Auth ---------
export const patientAuthAPI = {
  login: async ({ identifier, password }) => {
    try {
      const response = await api.post('/patient/login', {
        identifier,
        password,
      });

      const token = response.data?.data?.access_token;
      if (response.data.success && token) {
        localStorage.setItem('access_token', token);
        localStorage.setItem('role', 'patient');
        console.log('Patient token stored:', token);
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
    localStorage.removeItem('access_token');
    localStorage.removeItem('role');
    window.location.href = '/patient/login';
  },

  getProfile: async () => {
    const response = await api.get('/patient/profile');
    return response.data;
  },
};

// --------- Patient APIs ---------
export const patientAPI = {
  bookAppointment: async (data) => {
    const response = await api.post('/patient/book-appointment', data);
    return response.data;
  },

  getAppointments: async () => {
    const response = await api.get('/patient/appointments');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/patient/profile');
    return response.data;
  },

  getProviders: async () => {
    const response = await api.get('/patient/providers');
    return response.data;
  },

  getProviderAvailableSlots: async (providerId, date) => {
    const response = await api.get(`/patient/providers/${providerId}/available-slots?date=${date}`);
    return response.data;
  },
};

export default api;
