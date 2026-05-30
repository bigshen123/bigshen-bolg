import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Loader2 } from 'lucide-react';
import { ArticleCard } from '../components/common/Card';
import { articleService } from '../services/articleService';
import { categoryService } from '../services/categoryService';
import { formatDate } from '../utils/validation';
import type { Article, Category } from '../types/article';

/**
 * 分类筛选页
 */
const CategoryPage = () => {
    const { name: categoryName } = useParams<{ name: string }>();
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);

    /**
     * 加载分类列表
     */
    useEffect(() => {
        categoryService.getAllCategories().then(setCategories).catch(console.error);
    }, []);

    /**
     * 根据分类名称加载文章
     */
    const loadArticles = useCallback(async () => {
        const cat = categories.find((c) => c.name === categoryName);
        if (!cat) {
            setLoading(false);
            return;
        }
        setSelectedCategory(cat);
        try {
            const result = await articleService.getArticlesByCategory(cat.id);
            if (result) {
                const data = result as unknown as { content: Article[] };
                setArticles(data.content || []);
            }
        } catch (err) {
            console.error('加载分类文章失败:', err);
        } finally {
            setLoading(false);
        }
    }, [categoryName, categories]);

    useEffect(() => {
        if (categories.length > 0) {
            loadArticles();
        }
    }, [categories, loadArticles]);

    return (
        <div>
            <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    📂 {selectedCategory?.name || categoryName || '分类'}
                </h1>
                <p className="text-gray-500">{selectedCategory?.description || '按分类浏览文章'}</p>
            </motion.div>

            {/* 分类标签 */}
            {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => navigate(`/category/${c.name}`)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                c.name === categoryName
                                    ? 'bg-pink-500 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-pink-50 shadow-sm'
                            }`}
                        >
                            {c.name} ({c.articleCount})
                        </button>
                    ))}
                </div>
            )}

            {/* 文章列表 */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 size={36} className="animate-spin text-gray-400" />
                </div>
            ) : articles.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>该分类下暂无文章</p>
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

export default CategoryPage;
