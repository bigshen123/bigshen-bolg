import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, FileText, FolderTree, MessageSquare,
    Users, LogOut, Menu, X, ChevronLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
    { path: '/admin', label: '仪表盘', icon: <LayoutDashboard size={18} />, end: true },
    { path: '/admin/articles', label: '文章管理', icon: <FileText size={18} /> },
    { path: '/admin/categories', label: '分类管理', icon: <FolderTree size={18} /> },
    { path: '/admin/comments', label: '评论管理', icon: <MessageSquare size={18} /> },
    { path: '/admin/users', label: '用户管理', icon: <Users size={18} /> },
];

/**
 * 管理员后台布局
 */
const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem('blog-token');
        localStorage.removeItem('blog-user');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* 侧边栏 */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        className="fixed left-0 top-0 h-full w-60 bg-white shadow-lg z-50 flex flex-col"
                        initial={{ x: -240 }}
                        animate={{ x: 0 }}
                        exit={{ x: -240 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Logo */}
                        <div className="p-5 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">⚡</span>
                                    <span className="font-bold text-gray-800 text-lg">管理后台</span>
                                </div>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-1 hover:bg-gray-100 rounded-lg"
                                >
                                    <X size={16} className="text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* 导航菜单 */}
                        <nav className="flex-1 p-3 space-y-1">
                            {menuItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.end}
                                    onClick={() => {
                                        if (window.innerWidth < 768) setSidebarOpen(false);
                                    }}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                                        transition-all ${
                                            isActive
                                                ? 'bg-gradient-to-r from-pink-50 to-purple-50 text-pink-600'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`
                                    }
                                >
                                    {item.icon}
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>

                        {/* 底部操作 */}
                        <div className="p-3 border-t border-gray-100 space-y-2">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 px-3 py-2 w-full text-sm text-gray-500
                                         hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <ChevronLeft size={16} /> 返回博客
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3 py-2 w-full text-sm text-red-400
                                         hover:bg-red-50 rounded-xl transition-colors"
                            >
                                <LogOut size={16} /> 退出登录
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* 主内容区 */}
            <div className={`flex-1 transition-all duration-200 ${sidebarOpen ? 'ml-60' : 'ml-0'}`}>
                {/* 顶部栏 */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-3">
                    <div className="flex items-center justify-between">
                        {!sidebarOpen && (
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <Menu size={20} className="text-gray-600" />
                            </button>
                        )}
                        <div className="text-sm text-gray-400">
                            管理员控制台 · {new Date().toLocaleDateString('zh-CN', {
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                            })}
                        </div>
                    </div>
                </header>

                {/* 页面内容 */}
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
