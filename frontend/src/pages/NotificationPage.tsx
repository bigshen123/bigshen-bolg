import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, CheckCheck, Loader2 } from 'lucide-react';
import { notificationService, type NotificationItem } from '../services/notificationService';
import { formatDate } from '../utils/validation';

/**
 * 通知列表页面
 */
const NotificationPage = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    /** 加载通知 */
    const loadNotifications = async (currentPage: number, append = false) => {
        try {
            const data = await notificationService.getNotifications(currentPage, 20);
            if (append) {
                setNotifications((prev) => [...prev, ...(data.content || [])]);
            } else {
                setNotifications(data.content || []);
            }
            setHasMore(currentPage + 1 < data.totalPages);
        } catch (err) {
            console.error('加载通知失败:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications(0);
    }, []);

    /** 点击通知跳转 */
    const handleClick = async (notification: NotificationItem) => {
        if (!notification.isRead) {
            try {
                await notificationService.markAsRead(notification.id);
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === notification.id ? { ...n, isRead: true } : n
                    )
                );
            } catch { /* ignore */ }
        }
        if (notification.relatedId) {
            navigate(`/article/${notification.relatedId}`);
        }
    };

    /** 全部已读 */
    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('标记全部已读失败:', err);
        }
    };

    /** 加载更多 */
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadNotifications(nextPage, true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-40">
                <Loader2 size={36} className="animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* 头部 */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <ArrowLeft size={18} />
                    <span>返回</span>
                </button>
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Bell size={20} /> 通知中心
                </h1>
                <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1.5 text-xs text-pink-500 hover:text-pink-600
                             px-3 py-1.5 rounded-full hover:bg-pink-50 transition-colors"
                >
                    <CheckCheck size={14} />
                    全部已读
                </button>
            </div>

            {/* 通知列表 */}
            {notifications.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">暂无通知</p>
                    <p className="text-sm mt-1">当有人点赞或评论你的文章时，会在这里显示</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map((n, i) => (
                        <motion.div
                            key={n.id}
                            className={`bg-white rounded-2xl p-4 shadow-sm cursor-pointer
                                      hover:shadow-md transition-all ${
                                !n.isRead ? 'ring-1 ring-pink-200' : ''
                            }`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => handleClick(n)}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-xl flex-shrink-0 mt-0.5">
                                    {n.type === 'LIKE' ? '❤️' : '💬'}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${!n.isRead ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                                        {n.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {formatDate(n.createdAt)}
                                    </p>
                                </div>
                                {!n.isRead && (
                                    <span className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0 mt-2" />
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {hasMore && (
                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleLoadMore}
                                className="px-6 py-2 bg-white rounded-full shadow-sm text-gray-500
                                         hover:text-pink-500 text-sm transition-colors"
                            >
                                加载更多
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationPage;
