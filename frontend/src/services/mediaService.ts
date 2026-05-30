import api from './api';

/**
 * 媒体文件相关类型
 */
export interface MediaItem {
    id: number;
    url: string;
    type: string;
    description: string;
}

/**
 * 媒体资源API
 */
export const mediaService = {
    uploadImage: async (file: File, articleId: number): Promise<MediaItem> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('articleId', String(articleId));
        const response = await api.post<MediaItem>('/media/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    getArticleMedia: async (articleId: number): Promise<MediaItem[]> => {
        const response = await api.get<MediaItem[]>(`/media/article/${articleId}`);
        return response.data;
    },
};
