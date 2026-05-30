import api from './api';
import type { Article, PageResponse } from '../types/article';

/**
 * 收藏相关API
 */
export const favoriteService = {
    getUserFavorites: async (userId: number, page = 0, size = 10): Promise<PageResponse<Article> | null> => {
        const response = await api.get<PageResponse<Article>>(`/favorites/user/${userId}`, {
            params: { page, size },
        });
        return response.data;
    },

    addFavorite: async (userId: number, articleId: number): Promise<void> => {
        await api.post(`/favorites/${articleId}`, { userId });
    },

    removeFavorite: async (userId: number, articleId: number): Promise<void> => {
        await api.delete(`/favorites/${articleId}`, { data: { userId } });
    },

    checkFavorite: async (userId: number, articleId: number): Promise<boolean> => {
        const response = await api.get<{ favorited: boolean }>(`/favorites/check/${articleId}`, {
            params: { userId },
        });
        return response.data.favorited;
    },
};
