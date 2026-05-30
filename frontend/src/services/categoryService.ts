import api from './api';
import type { Category } from '../types/article';

/**
 * 分类相关API
 */
export const categoryService = {
    getAllCategories: async (): Promise<Category[]> => {
        const response = await api.get<Category[]>('/categories');
        return response.data;
    },

    getCategoryById: async (id: number): Promise<Category> => {
        const response = await api.get<Category>(`/categories/${id}`);
        return response.data;
    },

    createCategory: async (data: { name: string; description: string }): Promise<Category> => {
        const response = await api.post<Category>('/categories', data);
        return response.data;
    },

    updateCategory: async (id: number, data: { name: string; description: string }): Promise<Category> => {
        const response = await api.put<Category>(`/categories/${id}`, data);
        return response.data;
    },

    deleteCategory: async (id: number): Promise<boolean> => {
        await api.delete(`/categories/${id}`);
        return true;
    },
};
