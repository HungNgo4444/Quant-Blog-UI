import axios from 'axios';
import { clientCookies } from '../services/TokenService';

const instanceApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm token vào header
instanceApi.interceptors.request.use(
  (config) => {
    const token = clientCookies.getAuthTokens()?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Xử lý refresh token khi token hết hạn
instanceApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = clientCookies.getAuthTokens()?.refreshToken;
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Lưu tokens mới
        clientCookies.setAuthTokens({ 
          accessToken: accessToken, 
          refreshToken: newRefreshToken || refreshToken 
        });

        // Retry request với token mới
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return instanceApi(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        clientCookies.clearAuthTokens();
        
        // Chỉ redirect nếu đang ở client-side
        // if (typeof window !== 'undefined') {
        //   window.location.href = '/auth/login';
        // }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default instanceApi; 