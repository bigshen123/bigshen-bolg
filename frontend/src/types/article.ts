// 文章相关类型定义

export interface Article {
    id: number;
    title: string;
    content: string;
    summary: string;
    coverImage: string;
    authorId: number;
    authorName: string;
    authorAvatar: string;
    tags: string[];
    location: string;
    travelDate: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateArticleRequest {
    title: string;
    content: string;
    summary: string;
    coverImage: string;
    tags: string[];
    location: string;
    travelDate: string;
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}
