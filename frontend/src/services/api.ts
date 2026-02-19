import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || '';

export const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Callback invoked when any request returns 401 (session expired / token invalid).
// Registered by AuthContext so it can clear state and redirect to login.
let _onAuthFailure: (() => void) | null = null;
export function setAuthFailureCallback(fn: (() => void) | null) {
  _onAuthFailure = fn;
}

// Add request interceptor to attach token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      _onAuthFailure?.();
    }
    return Promise.reject(error);
  }
);
