import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Set your KosanKuPro Backend API base URL
// For local development on Android emulator use 'http://10.0.2.2:3000/api' or your PC local IP
export const API_BASE_URL = 'http://10.0.2.2:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor to attach JWT token to every request
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('user_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Error reading token from SecureStore:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
