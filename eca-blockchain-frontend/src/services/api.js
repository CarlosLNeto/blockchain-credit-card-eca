import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
};

export const transactionService = {
  transfer: (data) => api.post('/transactions/transfer', data),
  payment: (data) => api.post('/transactions/payment', data),
  getBalance: () => api.get('/transactions/balance'),
  getStatement: () => api.get('/transactions/statement'),
  getStatementByPeriod: (startDate, endDate) =>
    api.get(`/transactions/statement/period?startDate=${startDate}&endDate=${endDate}`),
};

export const blockchainService = {
  getChain: () => api.get('/blockchain/chain'),
  getPending: () => api.get('/blockchain/pending'),
  validate: () => api.get('/blockchain/validate'),
};

export default api;
