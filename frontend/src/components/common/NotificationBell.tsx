import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Loader2 } from 'lucide-react';
import { notificationService, type NotificationItem } from '../../services/notificationService';
import { formatDate } from '../../utils/validation';

/**
 * 通知铃铛组件 - 显示未读通知数和下拉列表
 */
const NotificationBell = () => {
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    /** 定期轮询未读通知数（每30秒） */
    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const count = await notificationService.getUnreadCount();
                setUnreadCount(count);
            } catch (err) {
                // 通知API失败时不显示红点，等下次轮询重试
                console.error('获取未读通知数失败:', err);
            }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, []);

    /** 点击铃铛时加载最近通知 */
    const handleToggle = async () => {
        if (!dropdownOpen) {
            try {
                setLoading(true);
                const data = await notificationService.getNotifications(0, 5);
                setRecentNotifications(data.content || []);
            } catch (err) {
                console.error('加载通知失败:', err);
            } finally {
                setLoading(false);
            }
        }
        setDropdownOpen(!dropdownOpen);
    };

    /** 点击外部关闭下拉 */
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /** 点击通知跳转文章 */
    const handleNotificationClick = async (notification: NotificationItem) => {
        // 标记已读
        try {
            await notificationService.markAsRead(notification.id);
            setUnreadCount((c) => Math.max(0, c - 1));
        } catch { /* ignore */ }
        setDropdownOpen(false);
        if (notification.relatedId) {
            navigate(`/article/${notification.relatedId}`);
        } else {
            navigate('/notifications');
        }
    };

    /** 查看全部通知 */
    const handleViewAll = () => {
        setDropdownOpen(false);
        navigate('/notifications');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className="relative p-2 rounded-full text-white/90 hover:bg-white/20 transition-all"
                title="通知"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <motion.span
                        className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center
                                 justify-center bg-red-500 text-white text-[10px] font-bold rounded-full
                                 px-1 leading-none"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.span>
                )}
            </button>

            <AnimatePresence>
                {dropdownOpen && (
                    <motion.div
                        className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border
                                 border-gray-100 overflow-hidden z-50"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                    >
                        <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                            <span className="font-semibold text-sm text-gray-700">🔔 通知</span>
                            <button
                                onClick={handleViewAll}
                                className="text-xs text-pink-500 hover:text-pink-600"
                            >
                                查看全部
                            </button>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {loading ? (
                                <div className="flex justify-center py-6">
                                    <Loader2 size={20} className="animate-spin text-gray-400" />
                                </div>
                            ) : recentNotifications.length === 0 ? (
                                <div className="py-8 text-center text-gray-400 text-sm">
                                    <Bell size={28} className="mx-auto mb-2 text-gray-300" />
                                    暂无通知
                                </div>
                            ) : (
                                recentNotifications.map((n) => (
                                    <button
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors
                                                  border-b border-gray-50 last:border-0 ${
                                            !n.isRead ? 'bg-pink-50/50' : ''
                                        }`}
                                    >
                                        <p className="text-sm text-gray-700 line-clamp-2">
                                            {n.type === 'LIKE' ? '❤️ ' : '💬 '}
                                            {n.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatDate(n.createdAt)}
                                        </p>
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
