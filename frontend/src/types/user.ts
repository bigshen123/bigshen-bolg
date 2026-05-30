// 用户相关类型定义

export interface User {
    id: number;
    username: string;
    email: string;
    avatar: string;
    themeColor: string;
    bio: string;
    role?: string;
    status?: string;
    articleCount: number;
    followerCount: number;
    followingCount: number;
    createdAt: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface Comment {
    id: number;
    content: string;
    articleId: number;
    userId: number;
    username: string;
    userAvatar: string;
    parentId: number | null;
    status?: string;
    replies: Comment[];
    createdAt: string;
}
