import axios from 'axios';

const API = axios.create({
  baseURL: 'https://school-management-api-vjtj.onrender.com/api',
  headers: { 'Content-Type': 'application/json' }
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;