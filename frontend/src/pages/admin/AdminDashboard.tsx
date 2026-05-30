import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, MessageSquare, Eye, TrendingUp, Loader2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { articleService } from '../../services/articleService';
import type { Article } from '../../types/article';

/**
 * 管理员仪表盘
 */
const AdminDashboard = () => {
    const [stats, setStats] = useState<Record<string, number>>({});
    const [hotArticles, setHotArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            adminService.getDashboard(),
            articleService.getHotArticles(5),
        ]).then(([s, hot]) => {
            setStats(s);
            setHotArticles(hot);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const statCards = [
        { label: '文章总数', value: stats.totalArticles || 0, icon: <FileText size={24} />, color: '#6366F1' },
        { label: '已发布', value: stats.publishedArticles || 0, icon: <TrendingUp size={24} />, color: '#10B981' },
        { label: '用户数', value: stats.totalUsers || 0, icon: <Users size={24} />, color: '#F59E0B' },
        { label: '总评论', value: stats.totalComments || 0, icon: <MessageSquare size={24} />, color: '#EC4899' },
        { label: '总阅读', value: stats.totalViews || 0, icon: <Eye size={24} />, color: '#3B82F6' },
    ];

    if (loading) {
        return <div className="flex justify-center py-40"><Loader2 size={36} className="animate-spin text-gray-400" /></div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">📊 数据仪表盘</h1>

            {/* 统计卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {statCards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        className="bg-white rounded-2xl p-5 shadow-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-xl" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                                {card.icon}
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-800">{card.value}</div>
                        <div className="text-sm text-gray-400 mt-1">{card.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* 热门文章 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    🔥 热门文章 TOP5
                </h2>
                <div className="space-y-3">
                    {hotArticles.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">暂无数据</div>
                    ) : (
                        hotArticles.map((a, i) => (
                            <div key={a.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50">
                                <span className={`text-lg font-bold w-8 ${i < 3 ? 'text-pink-500' : 'text-gray-300'}`}>
                                    #{i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-800 truncate">{a.title}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">
                                        👁 {a.viewCount} · ❤️ {a.likeCount} · 💬 {a.commentCount}
                                    </div>
                                </div>
                                <span className="text-xs px-2 py-1 bg-green-50 text-green-500 rounded-full">
                                    {a.categoryName || '未分类'}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
