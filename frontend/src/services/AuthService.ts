import axios from 'axios';
import instanceApi from '../lib/axios';
import { clientCookies } from './TokenService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const verifyEmail = async (token: string) => {
    try {
        const response = await axios.get(`${API_URL}/auth/verify-email?token=${token}`);
        return response.data;
    } catch (error) {
        console.error('Error verifying email:', error);
        throw error;
    }
};

// Client-side function - SỬ DỤNG instanceApi để có auto refresh token
export const getUser = async () => {
    try {
        const response = await instanceApi.get('/auth/me');
        return response.data.user;
    } catch (error) {
        console.error('Error getting user:', error);
        throw error;
    }
};

// Server-side function để sử dụng trong Server Components
export const getUserServer = async () => {
    try {
        const accessToken = clientCookies.getAuthTokens()?.accessToken;
        
        if (!accessToken) {
            return null;
        }

        const response = await axios.get(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        
        return response.data.user;
    } catch (error) {
        console.error('Error getting user on server:', error);
        return null;
    }
};

export async function changePassword(changePasswordDto: any) {
    try {
      const res = await instanceApi.put(`/auth/change-password`, changePasswordDto);
      return res.data;
    } catch (error) {
      console.error('Error changing password:', error);
      return null;
    }
  }

export async function forgotPassword(email: string) {
  try {
    const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return res.data;
  } catch (error) {
    console.error('Error sending forgot password email:', error);
    return null;
  }
}

export async function resetPassword(token: string) {
  try {
    const res = await axios.post(`${API_URL}/auth/reset-password`, { token });
    return res.data;
  } catch (error) {
    console.error('Error resetting password:', error);
    return null;
  }
}