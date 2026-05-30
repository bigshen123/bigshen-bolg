import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Loader2, BookOpen } from 'lucide-react';
import { ArticleCard } from '../components/common/Card';
import Button from '../components/common/Button';
import { favoriteService } from '../services/favoriteService';
import { formatDate } from '../utils/validation';
import type { Article } from '../types/article';

/**
 * 我的收藏页
 */
const FavoritesPage = () => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('blog-user');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            setUserId(user.id);
        }
    }, []);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }
        favoriteService.getUserFavorites(userId, 0, 50)
            .then((result) => {
                if (result) {
                    const data = result as unknown as { content: Article[] };
                    setArticles(data.content || []);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId]);

    if (!userId) {
        return (
            <div className="text-center py-20 text-gray-400">
                <Heart size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg mb-4">请先登录查看收藏</p>
                <Button onClick={() => navigate('/login')}>去登录</Button>
            </div>
        );
    }

    return (
        <div>
            <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    ❤️ 我的收藏
                </h1>
                <p className="text-gray-500">收藏的精彩旅行故事</p>
            </motion.div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 size={36} className="animate-spin text-gray-400" />
                </div>
            ) : articles.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>还没有收藏任何文章哦~</p>
                    <p className="text-sm mt-1">快去发现精彩的旅行故事吧</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {articles.map((article, index) => (
                        <motion.div
                            key={article.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <ArticleCard
                                title={article.title}
                                summary={article.summary}
                                coverImage={article.coverImage}
                                authorName={article.authorName}
                                authorAvatar={article.authorAvatar}
                                tags={article.tags}
                                location={article.location}
                                viewCount={article.viewCount}
                                likeCount={article.likeCount}
                                createdAt={formatDate(article.createdAt)}
                                onClick={() => navigate(`/article/${article.id}`)}
                            />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FavoritesPage;
