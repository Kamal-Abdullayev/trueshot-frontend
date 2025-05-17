import axios from 'axios';
import type { Reward, UserPoints } from '@/types/reward';

const API_URL = 'http://localhost:8090/api/v1';

const getUserIdFromToken = (token: string): string => {
    console.log('Getting userId from token...');
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    const decoded = JSON.parse(jsonPayload);
    console.log('Decoded token payload:', decoded);
    console.log('Extracted userId:', decoded.userId);
    return decoded.userId;
};

export const rewardService = {
    async getUserPoints(): Promise<number> {
        console.log('getUserPoints called');
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token ? 'exists' : 'missing');
        
        if (!token) {
            console.error('No token found in localStorage');
            throw new Error('No authentication token found');
        }

        try {
            const userId = getUserIdFromToken(token);
            console.log('Making request to get points for userId:', userId);
            console.log('Request URL:', `${API_URL}/auth/${userId}/points`);
            
            const response = await axios.get<number>(`${API_URL}/auth/${userId}/points`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Points response:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error in getUserPoints:', error);
            console.error('Error response:', error.response);
            if (error.response?.status === 401) {
                throw new Error('Invalid or missing token');
            } else if (error.response?.status === 404) {
                throw new Error('User not found');
            }
            throw new Error('Failed to fetch points');
        }
    },

    async getUserRewards(): Promise<string[]> {
        console.log('getUserRewards called');
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token ? 'exists' : 'missing');
        
        if (!token) {
            console.error('No token found in localStorage');
            throw new Error('No authentication token found');
        }

        try {
            const userId = getUserIdFromToken(token);
            console.log('Making request to get rewards for userId:', userId);
            console.log('Request URL:', `${API_URL}/auth/${userId}/rewards`);
            
            const response = await axios.get<string[]>(`${API_URL}/auth/${userId}/rewards`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Rewards response:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error in getUserRewards:', error);
            console.error('Error response:', error.response);
            if (error.response?.status === 401) {
                throw new Error('Invalid or missing token');
            } else if (error.response?.status === 404) {
                throw new Error('User not found');
            }
            throw new Error('Failed to fetch rewards');
        }
    }
}; 