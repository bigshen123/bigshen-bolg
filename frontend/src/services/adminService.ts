import api from './api';
import type { Article, PageResponse, Category } from '../types/article';
import type { User, Comment } from '../types/user';

/**
 * 管理员后台 API
 */
export const adminService = {
    // 仪表盘统计
    getDashboard: async (): Promise<Record<string, number>> => {
        const response = await api.get<Record<string, number>>('/admin/dashboard');
        return response.data;
    },

    // 获取所有文章（含草稿）
    getArticles: async (page = 0, size = 10, status?: string): Promise<PageResponse<Article> | null> => {
        const response = await api.get<PageResponse<Article>>('/admin/articles', {
            params: { page, size, status },
        });
        return response.data;
    },

    // 热门文章
    getHotArticles: async (limit = 10): Promise<Article[]> => {
        const response = await api.get<Article[]>('/admin/hot-articles', { params: { limit } });
        return response.data;
    },

    // 获取所有用户
    getUsers: async (): Promise<User[]> => {
        const response = await api.get<User[]>('/admin/users');
        return response.data;
    },

    // 获取所有评论
    getComments: async (): Promise<Comment[]> => {
        const response = await api.get<Comment[]>('/admin/comments');
        return response.data;
    },

    // 更新用户状态
    updateUserStatus: async (userId: number, status: string): Promise<User> => {
        const response = await api.put<User>(`/users/${userId}/status`, { status });
        return response.data;
    },

    // 更新用户角色
    updateUserRole: async (userId: number, role: string): Promise<User> => {
        const response = await api.put<User>(`/users/${userId}/role`, { role });
        return response.data;
    },

    // 删除评论
    deleteComment: async (commentId: number): Promise<void> => {
        await api.delete(`/comments/${commentId}`);
    },
};
