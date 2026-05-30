import api from './api';

export interface NotificationItem {
    id: number;
    type: string;
    message: string;
    relatedId: number;
    isRead: boolean;
    createdAt: string;
}

/**
 * 通知相关 API
 */
export const notificationService = {
    /** 获取通知列表 */
    getNotifications: async (page = 0, size = 20): Promise<{
        content: NotificationItem[];
        totalPages: number;
        totalElements: number;
    }> => {
        const response = await api.get('/notifications', {
            params: { page, size },
        });
        return response.data;
    },

    /** 获取未读通知数 */
    getUnreadCount: async (): Promise<number> => {
        const response = await api.get<{ count: number }>('/notifications/unread-count');
        return response.data.count;
    },

    /** 标记单条已读 */
    markAsRead: async (notificationId: number): Promise<void> => {
        await api.put(`/notifications/${notificationId}/read`);
    },

    /** 标记全部已读 */
    markAllAsRead: async (): Promise<void> => {
        await api.put('/notifications/read-all');
    },
};
