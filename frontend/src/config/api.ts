import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';

// API Configuration
// Uses relative path '/api' which nginx proxies to Kong API Gateway at http://117.103.71.86:30082
export const API_CONFIG = {
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
};

// Create axios instance
export const apiClient = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        // Handle common errors
        if (error.response) {
            // Server responded with error status
            console.error('API Error:', error.response.data);
        } else if (error.request) {
            // Request made but no response
            console.error('Network Error:', error.message);
        } else {
            // Something else happened
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);
