import type { Article } from '../types/article';

/**
 * 模拟文章详情数据
 */
export const MOCK_ARTICLE_DETAIL: Article & { authorName: string; authorAvatar: string } = {
    id: 1,
    title: '🌸 春天的小樽运河——浪漫雪国的旅行日记',
    content: '',
    summary: '漫步在小樽运河边，感受北海道最浪漫的雪国风光',
    coverImage: 'https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?w=1200',
    authorId: 1,
    authorName: '旅行小熊',
    authorAvatar: '🐻',
    tags: ['日本', '北海道', '雪景', '浪漫', '美食'],
    location: '日本·小樽',
    travelDate: '2024-02-14',
    viewCount: 2340,
    likeCount: 1218,
    commentCount: 56,
    createdAt: '2024-02-20T10:30:00',
    updatedAt: '2024-02-20T10:30:00',
};
