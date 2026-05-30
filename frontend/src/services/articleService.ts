import api from './api';
import type { Article, CreateArticleRequest, PageResponse } from '../types/article';

/**
 * 文章相关API
 */
export const articleService = {
    getArticles: async (page = 0, size = 10): Promise<PageResponse<Article> | null> => {
        const response = await api.get<PageResponse<Article>>('/articles', {
            params: { page, size },
        });
        return response.data;
    },

    getArticleById: async (id: number): Promise<Article | null> => {
        const response = await api.get<Article>(`/articles/${id}`);
        return response.data;
    },

    createArticle: async (data: CreateArticleRequest): Promise<Article | null> => {
        const response = await api.post<Article>('/articles', data);
        return response.data;
    },

    updateArticle: async (id: number, data: Partial<CreateArticleRequest>): Promise<Article | null> => {
        const response = await api.put<Article>(`/articles/${id}`, data);
        return response.data;
    },

    deleteArticle: async (id: number): Promise<boolean> => {
        await api.delete(`/articles/${id}`);
        return true;
    },

    likeArticle: async (id: number): Promise<Article | null> => {
        const response = await api.post<Article>(`/articles/${id}/like`);
        return response.data;
    },

    getArticlesByTag: async (tag: string, page = 0, size = 10): Promise<PageResponse<Article> | null> => {
        const response = await api.get<PageResponse<Article>>('/articles/search', {
            params: { tag, page, size },
        });
        return response.data;
    },

    searchArticles: async (keyword: string, page = 0, size = 10): Promise<PageResponse<Article> | null> => {
        const response = await api.get<PageResponse<Article>>('/articles/search', {
            params: { keyword, page, size },
        });
        return response.data;
    },
};
