import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Ban, CheckCircle, Loader2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { User } from '../../types/user';

/**
 * 用户管理页
 */
const AdminUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getUsers().then(setUsers).catch(console.error).finally(() => setLoading(false));
    }, []);

    const toggleStatus = async (user: User) => {
        const newStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
        try {
            const updated = await adminService.updateUserStatus(user.id, newStatus);
            setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        } catch (err) {
            console.error('更新状态失败:', err);
        }
    };

    const toggleRole = async (user: User) => {
        const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
        if (!window.confirm(`确定将 ${user.username} 的角色改为 ${newRole === 'ADMIN' ? '管理员' : '普通用户'} 吗？`)) return;
        try {
            const updated = await adminService.updateUserRole(user.id, newRole);
            setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        } catch (err) {
            console.error('更新角色失败:', err);
        }
    };

    const statusBadge = (status: string) => {
        const map: Record<string, { label: string; cls: string }> = {
            ACTIVE: { label: '正常', cls: 'bg-green-50 text-green-600' },
            DISABLED: { label: '已禁用', cls: 'bg-red-50 text-red-400' },
        };
        const info = map[status] || { label: status, cls: 'bg-gray-50 text-gray-500' };
        return <span className={`px-2 py-0.5 rounded-full text-xs ${info.cls}`}>{info.label}</span>;
    };

    const roleBadge = (role: string) => {
        return role === 'ADMIN'
            ? <span className="px-2 py-0.5 rounded-full text-xs bg-purple-50 text-purple-600">管理员</span>
            : <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600">用户</span>;
    };

    if (loading) {
        return <div className="flex justify-center py-40"><Loader2 size={36} className="animate-spin text-gray-400" /></div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">👥 用户管理</h1>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr className="text-left text-sm text-gray-500">
                            <th className="px-5 py-3 font-medium">用户名</th>
                            <th className="px-5 py-3 font-medium">邮箱</th>
                            <th className="px-5 py-3 font-medium">角色</th>
                            <th className="px-5 py-3 font-medium">状态</th>
                            <th className="px-5 py-3 font-medium">文章数</th>
                            <th className="px-5 py-3 font-medium">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr><td colSpan={6} className="px-5 py-16 text-center text-gray-400">暂无用户</td></tr>
                        ) : (
                            users.map((u, i) => (
                                <motion.tr
                                    key={u.id}
                                    className="border-t border-gray-50 hover:bg-gray-50/50 text-sm"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                >
                                    <td className="px-5 py-3 font-medium text-gray-800">
                                        {u.avatar} {u.username}
                                    </td>
                                    <td className="px-5 py-3 text-gray-500">{u.email}</td>
                                    <td className="px-5 py-3">{roleBadge(u.role || 'USER')}</td>
                                    <td className="px-5 py-3">{statusBadge(u.status || 'ACTIVE')}</td>
                                    <td className="px-5 py-3 text-gray-500">{u.articleCount}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleRole(u)}
                                                className="p-1.5 hover:bg-purple-50 rounded-lg text-gray-400 hover:text-purple-500"
                                                title="切换角色"
                                            >
                                                <Shield size={14} />
                                            </button>
                                            <button
                                                onClick={() => toggleStatus(u)}
                                                className={`p-1.5 rounded-lg ${
                                                    u.status === 'ACTIVE'
                                                        ? 'hover:bg-red-50 text-gray-400 hover:text-red-500'
                                                        : 'hover:bg-green-50 text-gray-400 hover:text-green-500'
                                                }`}
                                                title={u.status === 'ACTIVE' ? '禁用' : '启用'}
                                            >
                                                {u.status === 'ACTIVE' ? <Ban size={14} /> : <CheckCircle size={14} />}
                                            </button>
                                        </div>
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

export default AdminUsers;
