import axios from 'axios';

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

export const getUser = async (token: string) => {
    try {
        const response = await axios.get(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting user:', error);
        throw error;
    }
    
};
