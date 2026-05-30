import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { followService } from '../../services/followService';

interface FollowButtonProps {
    /** 要关注/取关的目标用户ID */
    userId: number;
    /** 目标用户名 */
    userName?: string;
    /** 自定义样式 */
    className?: string;
    /** 尺寸 */
    size?: 'sm' | 'md';
}

/**
 * 关注/取关按钮组件（防抖+状态同步）
 */
const FollowButton = ({ userId, userName, className = '', size = 'sm' }: FollowButtonProps) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);

    /** 加载关注状态 */
    useEffect(() => {
        let cancelled = false;
        const loadStatus = async () => {
            try {
                const status = await followService.checkFollowStatus(userId);
                if (!cancelled) {
                    setIsFollowing(status);
                }
            } catch (err) {
                console.error('检查关注状态失败:', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        loadStatus();
        return () => { cancelled = true; };
    }, [userId]);

    /** 点击关注/取关 */
    const handleToggle = async () => {
        if (toggling) return; // 防抖
        try {
            setToggling(true);
            const result = await followService.toggleFollow(userId);
            setIsFollowing(result.isFollowing);
        } catch (err) {
            console.error('关注操作失败:', err);
        } finally {
            setToggling(false);
        }
    };

    if (loading) {
        return (
            <span className={`inline-flex items-center ${className}`}>
                <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin text-gray-400" />
            </span>
        );
    }

    const sizeClasses = size === 'sm'
        ? 'text-xs px-3 py-1.5 rounded-full'
        : 'text-sm px-4 py-2 rounded-full';

    return (
        <motion.button
            onClick={handleToggle}
            disabled={toggling}
            className={`inline-flex items-center gap-1.5 font-medium transition-all ${
                isFollowing
                    ? 'bg-pink-50 text-pink-500 hover:bg-pink-100 border border-pink-200'
                    : 'bg-pink-500 text-white hover:bg-pink-600 shadow-sm'
            } ${sizeClasses} ${className}`}
            whileTap={{ scale: 0.95 }}
        >
            {toggling ? (
                <Loader2 size={size === 'sm' ? 12 : 14} className="animate-spin" />
            ) : isFollowing ? (
                <UserCheck size={size === 'sm' ? 12 : 14} />
            ) : (
                <UserPlus size={size === 'sm' ? 12 : 14} />
            )}
            {isFollowing ? '已关注' : `关注${userName ? ' ' + userName : ''}`}
        </motion.button>
    );
};

export default FollowButton;
