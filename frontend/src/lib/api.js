import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me')
};

// Hotel API
export const hotelAPI = {
  getSettings: () => api.get('/api/hotel/settings'),
  updateSettings: (data) => api.put('/api/hotel/settings', data),
  updateWidgetSettings: (data) => api.put('/api/hotel/widget-settings', data),
  getWidgetCode: () => api.get('/api/hotel/widget-code')
};

// Room API
export const roomAPI = {
  getRooms: () => api.get('/api/rooms'),
  createRoom: (data) => api.post('/api/rooms', data),
  updateRoom: (id, data) => api.put(`/api/rooms/${id}`, data),
  deleteRoom: (id) => api.delete(`/api/rooms/${id}`)
};

// Wallet API
export const walletAPI = {
  getWallets: () => api.get('/api/wallets'),
  updateWallets: (data) => api.put('/api/wallets', data)
};

// Stats API
export const statsAPI = {
  getStats: (period = '7d') => api.get('/api/stats', { params: { period } }),
  getGuests: () => api.get('/api/stats/guests')
};

// Analytics API
export const analyticsAPI = {
  getMCPDiscovery: async (days = 30) => {
    const response = await api.get(`/api/analytics/mcp-discovery?days=${days}`);
    return response.data.analytics;
  },
  
  getOverview: async () => {
    const response = await api.get('/api/analytics/overview');
    return response.data.overview;
  }
};

export default api;
