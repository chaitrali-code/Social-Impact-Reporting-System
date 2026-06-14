import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
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

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');

// ─── Projects ────────────────────────────────────────
export const getProjects = (params) => api.get('/projects', { params });
export const getProject = (id) => api.get(`/projects/${id}`);
export const createProject = (formData) =>
  api.post('/projects', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// ─── AI ──────────────────────────────────────────────
export const generateReport = (projectId) =>
  api.post(`/ai/generate-report/${projectId}`);
export const estimateAttendance = (formData) =>
  api.post('/ai/estimate-attendance', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const generateSocialMedia = (projectId) =>
  api.post(`/ai/social-media/${projectId}`);
export const getSDGMapping = (projectId) =>
  api.post(`/ai/sdg-mapping/${projectId}`);

// ─── Analytics ───────────────────────────────────────
export const getDashboardStats = () => api.get('/analytics/dashboard');
export const getSDGDistribution = () => api.get('/analytics/sdg-distribution');
export const getClubImpact = () => api.get('/analytics/club-impact');
export const getTimeline = () => api.get('/analytics/timeline');
export const getCategoryDistribution = () =>
  api.get('/analytics/category-distribution');

export default api;
