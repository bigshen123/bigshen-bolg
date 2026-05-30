import api from './api';

/**
 * 关注相关 API
 */
export const followService = {
    /** 关注/取关用户（toggle 模式） */
    toggleFollow: async (userId: number): Promise<{ isFollowing: boolean }> => {
        const response = await api.post<{ isFollowing: boolean }>(`/follow/${userId}`);
        return response.data;
    },

    /** 检查是否已关注 */
    checkFollowStatus: async (userId: number): Promise<boolean> => {
        const response = await api.get<{ isFollowing: boolean }>(`/follow/${userId}/status`);
        return response.data.isFollowing;
    },

    /** 获取用户关注列表 */
    getFollowing: async (userId: number, page = 0, size = 10) => {
        const response = await api.get(`/follow/${userId}/following`, {
            params: { page, size },
        });
        return response.data;
    },

    /** 获取用户粉丝列表 */
    getFollowers: async (userId: number, page = 0, size = 10) => {
        const response = await api.get(`/follow/${userId}/followers`, {
            params: { page, size },
        });
        return response.data;
    },
};
