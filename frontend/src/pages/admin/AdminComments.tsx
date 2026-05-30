import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Loader2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { Comment } from '../../types/user';

/**
 * 评论管理页
 */
const AdminComments = () => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getComments().then(setComments).catch(console.error).finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm('确定删除该评论吗？')) return;
        try {
            await adminService.deleteComment(id);
            setComments((prev) => prev.map((c) =>
                c.id === id ? { ...c, status: 'DELETED' } : c
            ));
        } catch (err) {
            console.error('删除失败:', err);
        }
    };

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            NORMAL: 'bg-green-50 text-green-600',
            DELETED: 'bg-red-50 text-red-400 line-through',
        };
        const labels: Record<string, string> = {
            NORMAL: '正常',
            DELETED: '已删除',
        };
        return (
            <span className={`px-2 py-0.5 rounded-full text-xs ${map[status] || 'bg-gray-50 text-gray-500'}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (loading) {
        return <div className="flex justify-center py-40"><Loader2 size={36} className="animate-spin text-gray-400" /></div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">💬 评论管理</h1>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr className="text-left text-sm text-gray-500">
                            <th className="px-5 py-3 font-medium">用户</th>
                            <th className="px-5 py-3 font-medium">内容</th>
                            <th className="px-5 py-3 font-medium">文章ID</th>
                            <th className="px-5 py-3 font-medium">状态</th>
                            <th className="px-5 py-3 font-medium">时间</th>
                            <th className="px-5 py-3 font-medium">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comments.length === 0 ? (
                            <tr><td colSpan={6} className="px-5 py-16 text-center text-gray-400">暂无评论</td></tr>
                        ) : (
                            comments.map((c, i) => (
                                <motion.tr
                                    key={c.id}
                                    className="border-t border-gray-50 hover:bg-gray-50/50 text-sm"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.02 }}
                                >
                                    <td className="px-5 py-3">
                                        <span className="font-medium text-gray-700">{c.username}</span>
                                    </td>
                                    <td className="px-5 py-3 text-gray-600 max-w-[300px] truncate">
                                        {c.content}
                                    </td>
                                    <td className="px-5 py-3 text-gray-400">#{c.articleId}</td>
                                    <td className="px-5 py-3">{statusBadge(c.status || 'NORMAL')}</td>
                                    <td className="px-5 py-3 text-gray-400 text-xs">
                                        {new Date(c.createdAt).toLocaleDateString('zh-CN')}
                                    </td>
                                    <td className="px-5 py-3">
                                        {c.status !== 'DELETED' && (
                                            <button onClick={() => handleDelete(c.id)}
                                                    className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminComments;
