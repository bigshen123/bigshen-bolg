import api from './api';
import type { Comment } from '../types/user';

/**
 * 评论相关API
 */
export const commentService = {
    getComments: async (articleId: number): Promise<Comment[]> => {
        const response = await api.get<Comment[]>(`/comments/article/${articleId}`);
        return response.data;
    },

    addComment: async (articleId: number, content: string): Promise<Comment> => {
        const response = await api.post<Comment>('/comments', { articleId, content });
        return response.data;
    },

    replyToComment: async (commentId: number, content: string): Promise<Comment> => {
        const response = await api.post<Comment>(`/comments/${commentId}/reply`, { content });
        return response.data;
    },
};
