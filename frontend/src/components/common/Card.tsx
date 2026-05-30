import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

/**
 * 通用卡通风格卡片组件
 */
const Card = ({ children, className = '', hover = true, onClick }: CardProps) => {
    return (
        <motion.div
            className={`cartoon-card ${hover ? 'cursor-pointer' : ''} ${className}`}
            whileHover={hover ? { y: -4, scale: 1.02 } : {}}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {children}
        </motion.div>
    );
};

/**
 * 文章卡片组件
 */
interface ArticleCardProps {
    title: string;
    summary?: string;
    coverImage?: string;
    authorName: string;
    authorAvatar: string;
    tags?: string[];
    location?: string;
    viewCount?: number;
    likeCount?: number;
    createdAt: string;
    onClick?: () => void;
}

export const ArticleCard = ({
    title,
    summary,
    coverImage,
    authorName,
    authorAvatar,
    tags,
    location,
    viewCount = 0,
    likeCount = 0,
    createdAt,
    onClick,
}: ArticleCardProps) => {
    return (
        <Card onClick={onClick}>
            {/* 封面图 */}
            <div className="relative h-48 overflow-hidden rounded-t-2xl">
                <img
                    src={coverImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                {location && (
                    <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm
                                   rounded-full text-xs font-medium text-gray-700 flex items-center gap-1">
                        📍 {location}
                    </span>
                )}
            </div>

            {/* 内容 */}
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{title}</h3>
                {summary && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{summary}</p>
                )}

                {/* 标签 */}
                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {tags.slice(0, 4).map((tag) => (
                            <span
                                key={tag}
                                className="cartoon-tag bg-pink-50 text-pink-500 text-xs"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* 底部信息 */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{authorAvatar}</span>
                        <span className="text-sm text-gray-600">{authorName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>👁 {viewCount}</span>
                        <span>❤️ {likeCount}</span>
                        <span>{createdAt}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default Card;
