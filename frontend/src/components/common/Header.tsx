import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, Home, Image, Map, Compass, PenLine, Shield } from 'lucide-react';
import { useThemeContext } from '../theme/ThemeProvider';
import AnimalAvatar from '../theme/AnimalAvatar';

const NAV_ITEMS = [
    { path: '/', label: '首页', icon: <Home size={18} /> },
    { path: '/gallery', label: '相册', icon: <Image size={18} /> },
    { path: '/map', label: '地图', icon: <Map size={18} /> },
];

/**
 * 顶部导航栏组件
 */
const Header = () => {
    const { config, randomizeTheme } = useThemeContext();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    // 检查当前用户是否为管理员
    const isAdmin = useMemo(() => {
        try {
            const saved = localStorage.getItem('blog-user');
            if (!saved) return false;
            return JSON.parse(saved).role === 'ADMIN';
        } catch {
            return false;
        }
    }, []);

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 h-16"
            style={{
                background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary})`,
            }}
        >
            <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <motion.span
                        className="text-2xl"
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                    >
                        🌍
                    </motion.span>
                    <span className="text-white font-bold text-xl tracking-wide">
                        bigshen的旅行小窝
                    </span>
                </Link>

                {/* 桌面导航 */}
                <nav className="hidden md:flex items-center gap-1">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white/90
                                     hover:bg-white/20 hover:text-white transition-all duration-200"
                        >
                            {item.icon}
                            <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                    ))}

                    {/* 写文章按钮 */}
                    <button
                        onClick={() => navigate('/article/new')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full
                                 bg-white/20 text-white hover:bg-white/30 transition-all duration-200"
                    >
                        <PenLine size={18} />
                        <span className="text-sm font-medium">写文章</span>
                    </button>

                    {/* 搜索按钮 */}
                    <button
                        onClick={() => setSearchOpen(!searchOpen)}
                        className="p-2 rounded-full text-white/90 hover:bg-white/20 transition-all"
                    >
                        <Search size={18} />
                    </button>

                    {/* 换肤按钮 */}
                    <button
                        onClick={randomizeTheme}
                        className="p-2 rounded-full text-white/90 hover:bg-white/20 transition-all"
                        title="随机换肤"
                    >
                        <Compass size={18} />
                    </button>

                    {/* 管理员后台入口 */}
                    {isAdmin && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-full
                                     bg-yellow-400/20 text-yellow-100 hover:bg-yellow-400/30
                                     transition-all duration-200"
                            title="管理后台"
                        >
                            <Shield size={16} />
                            <span className="text-xs font-medium">管理</span>
                        </button>
                    )}

                    {/* 用户头像 */}
                    <button
                        onClick={() => navigate('/profile')}
                        className="ml-2 p-1 rounded-full hover:bg-white/20 transition-all"
                    >
                        <AnimalAvatar animal={config.animalCharacter} size="sm" />
                    </button>
                </nav>

                {/* 移动端菜单 */}
                <button
                    className="md:hidden p-2 text-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* 搜索栏 */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-white shadow-lg px-4 py-3"
                    >
                        <div className="max-w-xl mx-auto relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="搜索旅行文章..."
                                className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100
                                         border-2 border-transparent focus:border-primary-pink
                                         focus:bg-white outline-none transition-all"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 移动端菜单 */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="md:hidden bg-white shadow-lg rounded-b-2xl mx-2"
                    >
                        <nav className="flex flex-col p-2">
                            {NAV_ITEMS.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl
                                             hover:bg-gray-100 transition-colors"
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                            <button
                                onClick={() => { navigate('/article/new'); setMobileMenuOpen(false); }}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl
                                         text-pink-600 hover:bg-pink-50 transition-colors font-medium"
                            >
                                <PenLine size={18} />
                                <span>写文章</span>
                            </button>
                            {isAdmin && (
                                <button
                                    onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl
                                             text-purple-600 hover:bg-purple-50 transition-colors font-medium"
                                >
                                    <Shield size={18} />
                                    <span>管理后台</span>
                                </button>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
