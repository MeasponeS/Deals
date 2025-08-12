import axios from 'axios';
import { useUserStore } from '@/store/user';

export interface Todo {
  id: number;
  title: string;
  content: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
  createdAt: string;
  dueAt: string | null;
  reminderAt: string | null;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW' | string;
}

export interface TodoRequest {
    title: string;
    content: string;
    dueAt: string | null;
    reminderAt: string | null;
    urgency: string;
}

export interface Memo {
  id: number;
  title: string;
  content: string;
  tags: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemoRequest {
    title: string;
    content: string;
    tags: string;
}

// Helper function to sanitize the token, removing extra quotes or whitespace
const sanitizeToken = (token: any): string | null => {
  if (typeof token === 'string') {
    return token.trim().replace(/^"|"$/g, '');
  }
  return null;
};

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
    const token = sanitizeToken(userStore.token); // Sanitize right before use
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
      // userStore.logout();
      // Prevent redirect loop if already on login page
      // if (window.location.pathname !== '/login') {
      //   window.location.href = '/login';
      // }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Todo API (baseURL '/dev' -> proxy to '/api')
export const getTodos = (params?: { title?: string; status?: string }) => apiClient.get<Todo[]>('/todos', { params });
export const getTodosByDate = () => apiClient.get('/todos/by-date');
export const createTodo = (data: TodoRequest) => apiClient.post<Todo>('/todos', data);
export const updateTodo = (id: number, data: TodoRequest) => apiClient.put<Todo>(`/todos/${id}`, data);
export const completeTodo = (id: number) => apiClient.put<Todo>(`/todos/${id}/complete`);
export const deleteTodo = (id: number) => apiClient.delete(`/todos/${id}`);

// Memo API
export const getMemos = (params?: { title?: string }) => apiClient.get<Memo[]>('/memos', { params });
export const createMemo = (data: MemoRequest) => apiClient.post<Memo>('/memos', data);
export const updateMemo = (id: number, data: MemoRequest) => apiClient.put<Memo>(`/memos/${id}`, data);
export const deleteMemo = (id: number) => apiClient.delete(`/memos/${id}`);
