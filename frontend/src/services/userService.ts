import api from './api';
import type { User, LoginRequest, RegisterRequest, LoginResponse } from '../types/user';

/**
 * 用户相关API
 */
export const userService = {
    login: async (data: LoginRequest): Promise<LoginResponse | null> => {
        const response = await api.post<LoginResponse>('/auth/login', data);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<LoginResponse | null> => {
        const response = await api.post<LoginResponse>('/auth/register', data);
        return response.data;
    },

    getProfile: async (userId: number): Promise<User | null> => {
        const response = await api.get<User>(`/users/${userId}`);
        return response.data;
    },

    updateProfile: async (userId: number, data: Partial<User>): Promise<User | null> => {
        const response = await api.put<User>(`/users/${userId}`, data);
        return response.data;
    },
};
