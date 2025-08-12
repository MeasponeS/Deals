import axios from 'axios';
import { useUserStore } from '@/store/user';

const apiClient = axios.create({
  baseURL: '/dev', // This will be proxied by Vite in development
});

// List of public paths that don't require authentication
const publicPaths = ['/auth/signin', '/auth/signup', '/auth/forgot-password'];

// Request interceptor to add the auth token to headers
apiClient.interceptors.request.use(
  (config) => {
    // Check if the request path is public
    if (config.url && publicPaths.includes(config.url)) {
      return config;
    }

    const userStore = useUserStore();
    const token = userStore.token;
    console.log(token, '===');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const userStore = useUserStore();
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, redirect to login
      userStore.logout();
      // Prevent redirect loop if already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
