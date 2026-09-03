import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tpi_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalizes error responses so components can just read err.message
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || 'Something went wrong. Please try again.';
    return Promise.reject({ ...err, message });
  }
);

export const assetUrl = (filename) => {
  if (!filename) return null;
  const base = API_URL.replace(/\/api\/?$/, '');
  return `${base}/uploads/${filename}`;
};

export const AuthAPI = {
  registerCustomer: (data) => api.post('/auth/register/customer', data),
  registerVendor: (data) => api.post('/auth/register/vendor', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data)
};

export const VendorAPI = {
  listPublic: () => api.get('/vendors'),
  getPublic: (id) => api.get(`/vendors/${id}`),
  myProfile: () => api.get('/vendors/me/profile'),
  updateMyProfile: (data) => api.put('/vendors/me/profile', data),
  uploadLogo: (formData) => api.post('/vendors/me/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  myDashboard: () => api.get('/vendors/me/dashboard'),
  adminListAll: (params) => api.get('/vendors/admin/all', { params }),
  adminGetOne: (id) => api.get(`/vendors/admin/${id}`),
  adminSetStatus: (id, status) => api.put(`/vendors/admin/${id}/status`, { status })
};

export const CategoryAPI = {
  listMine: () => api.get('/categories/mine'),
  listByVendorPublic: (vendorId) => api.get(`/categories/vendor/${vendorId}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  remove: (id) => api.delete(`/categories/${id}`)
};

export const FoodAPI = {
  listPublic: (params) => api.get('/foods', { params }),
  getOnePublic: (id) => api.get(`/foods/${id}`),
  listMine: () => api.get('/foods/mine'),
  create: (formData) => api.post('/foods', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/foods/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  setAvailability: (id, availability) => api.put(`/foods/${id}/availability`, { availability }),
  remove: (id) => api.delete(`/foods/${id}`)
};

export const OrderAPI = {
  create: (data) => api.post('/orders', data),
  myOrders: () => api.get('/orders/mine'),
  getOne: (id) => api.get(`/orders/${id}`),
  vendorOrders: (params) => api.get('/orders/vendor/mine', { params }),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  updatePayment: (id, data) => api.put(`/orders/${id}/payment`, data),
  vendorSalesReport: () => api.get('/orders/vendor/sales-report'),
  adminListAll: (params) => api.get('/orders/admin/all', { params })
};

export const NotificationAPI = {
  list: () => api.get('/notifications'),
  unreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all')
};

export const AdminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  listCustomers: (params) => api.get('/admin/customers', { params }),
  getCustomer: (id) => api.get(`/admin/customers/${id}`),
  setCustomerStatus: (id, status) => api.put(`/admin/customers/${id}/status`, { status }),
  transactions: () => api.get('/admin/transactions'),
  report: (type) => api.get(`/admin/reports/${type}`),
  activityLogs: (params) => api.get('/admin/activity-logs', { params })
};

export default api;
