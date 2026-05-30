import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Edit3, Trash2, Loader2, Eye, Plus } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { articleService } from '../../services/articleService';
import Button from '../../components/common/Button';
import type { Article } from '../../types/article';

/**
 * 文章管理页
 */
const AdminArticles = () => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const loadArticles = useCallback(async (p: number) => {
        try {
            setLoading(true);
            const result = await adminService.getArticles(p, 10, statusFilter || undefined);
            if (result) {
                const data = result as unknown as { content: Article[]; totalPages: number };
                setArticles(data.content || []);
                setTotalPages(data.totalPages);
            }
        } catch (err) {
            console.error('加载文章失败:', err);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        setPage(0);
        loadArticles(0);
    }, [statusFilter, loadArticles]);

    useEffect(() => {
        if (page > 0) loadArticles(page);
    }, [page, loadArticles]);

    const handleDelete = async (id: number) => {
        if (!window.confirm('确定删除这篇文章吗？')) return;
        try {
            await articleService.deleteArticle(id);
            setArticles((prev) => prev.filter((a) => a.id !== id));
        } catch (err) {
            console.error('删除失败:', err);
        }
    };

    const statusLabel = (s: string) => {
        const map: Record<string, { label: string; color: string }> = {
            PUBLISHED: { label: '已发布', color: 'bg-green-50 text-green-600' },
            DRAFT: { label: '草稿', color: 'bg-yellow-50 text-yellow-600' },
        };
        const info = map[s] || { label: s, color: 'bg-gray-50 text-gray-600' };
        return <span className={`px-2 py-0.5 rounded-full text-xs ${info.color}`}>{info.label}</span>;
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">📝 文章管理</h1>
                <Link to="/article/new">
                    <Button icon={<Plus size={16} />} size="sm">写文章</Button>
                </Link>
            </div>

            {/* 状态筛选 */}
            <div className="flex gap-2 mb-4">
                {['', 'PUBLISHED', 'DRAFT'].map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            statusFilter === s
                                ? 'bg-pink-500 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {s === '' ? '全部' : s === 'PUBLISHED' ? '已发布' : '草稿'}
                    </button>
                ))}
            </div>

            {/* 文章列表 */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 size={36} className="animate-spin text-gray-400" /></div>
            ) : articles.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl text-gray-400">暂无文章</div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr className="text-left text-sm text-gray-500">
                                <th className="px-5 py-3 font-medium">标题</th>
                                <th className="px-5 py-3 font-medium">分类</th>
                                <th className="px-5 py-3 font-medium">状态</th>
                                <th className="px-5 py-3 font-medium">阅读</th>
                                <th className="px-5 py-3 font-medium">点赞</th>
                                <th className="px-5 py-3 font-medium">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map((a, i) => (
                                <motion.tr
                                    key={a.id}
                                    className="border-t border-gray-50 hover:bg-gray-50/50 text-sm"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                >
                                    <td className="px-5 py-3">
                                        <div className="font-medium text-gray-800 truncate max-w-[300px]">{a.title}</div>
                                    </td>
                                    <td className="px-5 py-3 text-gray-500">{a.categoryName || '-'}</td>
                                    <td className="px-5 py-3">{statusLabel(a.status)}</td>
                                    <td className="px-5 py-3 text-gray-500">{a.viewCount}</td>
                                    <td className="px-5 py-3 text-gray-500">{a.likeCount}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => window.open(`/article/${a.id}`, '_blank')}
                                               className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-500">
                                                <Eye size={14} />
                                            </button>
                                            <button onClick={() => navigate(`/article/${a.id}/edit`)}
                                               className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-pink-500">
                                                <Edit3 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(a.id)}
                                                    className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>

                    {/* 分页 */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={`w-8 h-8 rounded-lg text-sm ${page === i
                                        ? 'bg-pink-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminArticles;
