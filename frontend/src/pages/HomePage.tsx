import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Sparkles, ChevronDown, Loader2 } from 'lucide-react';
import { useThemeContext } from '../components/theme/ThemeProvider';
import { ArticleCard } from '../components/common/Card';
import Sidebar from '../components/layout/Sidebar';
import { articleService } from '../services/articleService';
import { formatDate } from '../utils/validation';
import type { Article } from '../types/article';

const FEATURED_DESTINATIONS = [
    { name: '日本·北海道', emoji: '⛄', color: '#74B9FF' },
    { name: '巴厘岛', emoji: '🌴', color: '#00B894' },
    { name: '云南·丽江', emoji: '🏮', color: '#E17055' },
    { name: '京都', emoji: '🍁', color: '#FD79A8' },
];

const PAGE_SIZE = 10;

/**
 * 首页组件
 */
const HomePage = () => {
    const navigate = useNavigate();
    const { config, randomizeTheme } = useThemeContext();
    const [articles, setArticles] = useState<Article[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    /**
     * 从后端加载文章列表
     */
    const loadArticles = useCallback(async (currentPage: number, append = false) => {
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            const result = await articleService.getArticles(currentPage, PAGE_SIZE);
            if (result) {
                // 后端返回 Spring Data Page 格式: { content, totalPages, totalElements, ... }
                const data = result as unknown as {
                    content: Article[];
                    totalPages: number;
                    totalElements: number;
                };
                const articleList = data.content || [];
                if (append) {
                    setArticles((prev) => [...prev, ...articleList]);
                } else {
                    setArticles(articleList);
                }
                setHasMore(currentPage + 1 < data.totalPages);
            }
        } catch (err) {
            console.error('加载文章列表失败:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    /**
     * 搜索文章
     */
    const searchArticles = useCallback(async () => {
        try {
            setLoading(true);
            let result;
            if (searchQuery) {
                result = await articleService.searchArticles(searchQuery, 0, PAGE_SIZE);
            } else if (activeFilter !== 'all') {
                result = await articleService.getArticlesByTag(activeFilter, 0, PAGE_SIZE);
            } else {
                result = await articleService.getArticles(0, PAGE_SIZE);
            }
            if (result) {
                const data = result as unknown as { content: Article[]; totalPages: number };
                setArticles(data.content || []);
                setHasMore(1 < data.totalPages);
                setPage(0);
            }
        } catch (err) {
            console.error('搜索文章失败:', err);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, activeFilter]);

    // 初次加载
    useEffect(() => {
        loadArticles(0);
    }, [loadArticles]);

    // 筛选或搜索变化时重新查询
    useEffect(() => {
        if (searchQuery || activeFilter !== 'all') {
            searchArticles();
        } else {
            loadArticles(0);
        }
    }, [searchQuery, activeFilter, searchArticles, loadArticles]);

    /**
     * 加载更多
     */
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadArticles(nextPage, true);
    };

    const filters = useMemo(() => {
        const tags = new Set<string>();
        articles.forEach((a) => a.tags?.forEach((t) => tags.add(t)));
        return ['all', ...Array.from(tags).slice(0, 8)];
    }, [articles]);

    return (
        <div className="flex gap-6">
            {/* 主内容区 */}
            <div className="flex-1 min-w-0">
                {/* 英雄区域 */}
                <motion.div
                    className="relative rounded-3xl overflow-hidden mb-8 h-64 md:h-80"
                    style={{
                        background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary})`,
                    }}
                >
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                        <motion.div
                            className="text-6xl mb-4"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                        >
                            {config.animalCharacter.emoji}
                        </motion.div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">
                            探索世界，记录美好
                        </h1>
                        <p className="text-white/80 text-lg mb-4 text-center">
                            和{config.animalCharacter.name}一起出发！
                        </p>
                        <button
                            onClick={randomizeTheme}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white/20 backdrop-blur-sm
                                     rounded-full text-white hover:bg-white/30 transition-all"
                        >
                            <Sparkles size={18} />
                            换个风格看看
                        </button>
                    </div>
                    {/* 装饰元素 */}
                    <div className="absolute top-4 right-4 text-4xl opacity-30 animate-float">⭐</div>
                    <div className="absolute bottom-6 left-6 text-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }}>🌈</div>
                    <div className="absolute top-10 left-10 text-2xl opacity-25 animate-float" style={{ animationDelay: '2s' }}>☁️</div>
                </motion.div>

                {/* 精选目的地 */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span>🌟</span> 精选目的地
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {FEATURED_DESTINATIONS.map((dest) => (
                            <motion.div
                                key={dest.name}
                                className="relative rounded-2xl p-4 text-center cursor-pointer overflow-hidden"
                                style={{ background: `${dest.color}20` }}
                                whileHover={{ scale: 1.05, background: `${dest.color}40` }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="text-3xl mb-2">{dest.emoji}</div>
                                <div className="text-sm font-medium text-gray-700">{dest.name}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* 搜索和筛选 */}
                <div className="mb-6 space-y-3">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="搜索旅行目的地或故事..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl shadow-sm
                                     border-2 border-transparent focus:border-pink-300
                                     outline-none transition-all text-sm"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {filters.map((f) => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`cartoon-tag text-xs transition-all ${
                                    activeFilter === f
                                        ? 'bg-primary-pink text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {f === 'all' ? '✨ 全部' : `#${f}`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 文章列表 */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 size={36} className="animate-spin text-gray-400" />
                    </div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-lg">暂无文章</p>
                        <p className="text-sm mt-2">去写一篇精彩的旅行日记吧！</p>
                    </div>
                ) : (
                    <>
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
                                        categoryName={article.categoryName}
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

                        {/* 加载更多 */}
                        {hasMore && (
                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="flex items-center gap-2 px-8 py-3 bg-white rounded-full
                                             shadow-md text-gray-600 hover:text-primary-pink hover:shadow-lg
                                             transition-all disabled:opacity-50"
                                >
                                    {loadingMore ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <ChevronDown size={16} />
                                    )}
                                    {loadingMore ? '加载中...' : '加载更多'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* 侧边栏 */}
            <Sidebar />
        </div>
    );
};

export default HomePage;
