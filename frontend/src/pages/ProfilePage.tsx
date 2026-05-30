import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Settings, Heart, BookOpen,
    Edit3, LogOut, Mail, Globe, Loader2,
} from 'lucide-react';
import { useThemeContext } from '../components/theme/ThemeProvider';
import AnimalAvatar from '../components/theme/AnimalAvatar';
import ColorGenerator from '../components/theme/ColorGenerator';
import Button from '../components/common/Button';
import { getAnimalList } from '../utils/themeUtils';
import { userService } from '../services/userService';
import { articleService } from '../services/articleService';
import { formatDate } from '../utils/validation';
import type { User } from '../types/user';
import type { Article } from '../types/article';

/**
 * 个人资料页面
 */
const ProfilePage = () => {
    const { config, randomizeTheme, setAnimal } = useThemeContext();
    const animals = getAnimalList();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'articles' | 'likes' | 'settings'>('articles');

    const [user, setUser] = useState<User | null>(null);
    const [userArticles, setUserArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({ username: '', bio: '', email: '' });

    /**
     * 从 localStorage 获取当前用户信息
     */
    const getSavedUser = (): User | null => {
        try {
            const saved = localStorage.getItem('blog-user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    };

    /**
     * 加载用户资料
     */
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                const savedUser = getSavedUser();
                if (!savedUser) {
                    setLoading(false);
                    return;
                }
                // 从后端获取最新用户信息
                const userData = await userService.getProfile(savedUser.id);
                if (userData) {
                    setUser(userData);
                    setEditForm({
                        username: userData.username,
                        bio: userData.bio || '',
                        email: userData.email,
                    });
                    // 更新 localStorage
                    localStorage.setItem('blog-user', JSON.stringify(userData));
                } else {
                    setUser(savedUser);
                }
            } catch (err) {
                console.error('加载用户资料失败:', err);
                const savedUser = getSavedUser();
                if (savedUser) setUser(savedUser);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    /**
     * 加载用户的文章
     */
    useEffect(() => {
        const loadUserArticles = async () => {
            try {
                const result = await articleService.getArticles(0, 20);
                if (result) {
                    const data = result as unknown as { content: Article[] };
                    const all = data.content || [];
                    if (user) {
                        setUserArticles(all.filter((a) => a.authorId === user.id));
                    }
                }
            } catch (err) {
                console.error('加载用户文章失败:', err);
            }
        };
        if (user) {
            loadUserArticles();
        }
    }, [user]);

    /**
     * 保存编辑
     */
    const handleSaveProfile = async () => {
        if (!user) return;
        try {
            const updated = await userService.updateProfile(user.id, editForm);
            if (updated) {
                setUser(updated);
                localStorage.setItem('blog-user', JSON.stringify(updated));
                setEditing(false);
            }
        } catch (err) {
            console.error('更新资料失败:', err);
        }
    };

    /**
     * 退出登录
     */
    const handleLogout = () => {
        localStorage.removeItem('blog-token');
        localStorage.removeItem('blog-user');
        navigate('/login');
    };

    const tabs = [
        { key: 'articles', label: '我的文章', icon: <BookOpen size={16} /> },
        { key: 'likes', label: '我的收藏', icon: <Heart size={16} /> },
        { key: 'settings', label: '账号设置', icon: <Settings size={16} /> },
    ] as const;

    if (loading) {
        return (
            <div className="flex justify-center items-center py-40">
                <Loader2 size={36} className="animate-spin text-gray-400" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20 text-gray-400">
                <p className="text-lg mb-4">请先登录查看个人资料</p>
                <Button onClick={() => navigate('/login')}>去登录</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* 个人资料头部 */}
            <motion.div
                className="relative rounded-3xl overflow-hidden mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* 背景 */}
                <div
                    className="h-40 md:h-52"
                    style={{
                        background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary})`,
                    }}
                />
                {/* 头像和信息 */}
                <div className="bg-white rounded-t-3xl -mt-10 px-6 pt-0 pb-6 relative z-10">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-14">
                        <AnimalAvatar animal={config.animalCharacter} size="lg" />
                        <div className="text-center md:text-left flex-1">
                            {editing ? (
                                <input
                                    type="text"
                                    value={editForm.username}
                                    onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))}
                                    className="text-2xl font-bold text-gray-800 mt-2 bg-gray-50 rounded-xl px-3 py-1
                                             outline-none border-2 border-pink-200 w-full max-w-[200px]"
                                />
                            ) : (
                                <h1 className="text-2xl font-bold text-gray-800 mt-2">
                                    {user.username}
                                </h1>
                            )}
                            {editing ? (
                                <input
                                    type="text"
                                    value={editForm.bio}
                                    onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                                    className="text-gray-500 text-sm mt-1 bg-gray-50 rounded-xl px-3 py-1
                                             outline-none border-2 border-pink-200 w-full"
                                    placeholder="介绍一下自己..."
                                />
                            ) : (
                                <p className="text-gray-500 text-sm mt-1">{user.bio || '这个人很懒，什么都没写~'}</p>
                            )}
                            <p className="text-gray-400 text-xs mt-1">
                                {formatDate(user.createdAt)} 加入
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {editing ? (
                                <>
                                    <Button size="sm" onClick={handleSaveProfile}>
                                        保存
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                                        取消
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        icon={<Edit3 size={14} />}
                                        onClick={() => setEditing(true)}
                                    >
                                        编辑资料
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        icon={<LogOut size={14} />}
                                        onClick={handleLogout}
                                    >
                                        退出
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 统计数据 */}
                    <div className="flex justify-around mt-6 py-4 border-y border-gray-100">
                        {[
                            { value: user.articleCount || userArticles.length, label: '文章' },
                            { value: user.followerCount || 0, label: '粉丝' },
                            { value: user.followingCount || 0, label: '关注' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-xl font-bold text-gray-800">{stat.value}</div>
                                <div className="text-xs text-gray-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* 标签页 */}
            <div className="flex gap-1 mb-6 bg-white rounded-2xl p-1.5 shadow-sm">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
                                 text-sm font-medium transition-all ${
                            activeTab === tab.key
                                ? 'bg-pink-50 text-pink-500 shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* 内容区 */}
            {activeTab === 'articles' && (
                userArticles.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>还没有发布任何文章哦~</p>
                        <p className="text-sm mt-1">开始写一篇旅行日记吧</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userArticles.map((article, i) => (
                            <motion.div
                                key={article.id}
                                className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer
                                         hover:shadow-md transition-all"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -2 }}
                                onClick={() => navigate(`/article/${article.id}`)}
                            >
                                <h3 className="font-semibold text-gray-800 mb-2">{article.title}</h3>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                    {article.location && <span>📍 {article.location}</span>}
                                    <span>📅 {formatDate(article.createdAt)}</span>
                                    <span>👁 {article.viewCount}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )
            )}

            {activeTab === 'likes' && (
                <div className="text-center py-16 text-gray-400">
                    <Heart size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>还没有收藏任何文章哦~</p>
                    <p className="text-sm mt-1">快去发现精彩的旅行故事吧</p>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="space-y-6">
                    {/* 主题设置 */}
                    <ColorGenerator />

                    {/* 动物角色选择 */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-700 mb-4">🐾 选择旅行伙伴</h3>
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                            {animals.map((animal) => (
                                <motion.button
                                    key={animal.id}
                                    onClick={() => setAnimal(animal)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                                        config.animalCharacter.id === animal.id
                                            ? 'bg-pink-50 ring-2 ring-pink-300 shadow-md'
                                            : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span className="text-3xl">{animal.emoji}</span>
                                    <span className="text-xs font-medium text-gray-600">{animal.name}</span>
                                    <span className="text-xs text-gray-400 text-center leading-tight">
                                        {animal.description}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* 基本信息 */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
                        <h3 className="font-semibold text-gray-700 mb-2">📧 基本信息</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600 p-3 bg-gray-50 rounded-xl">
                            <Mail size={16} className="text-gray-400" />
                            <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 p-3 bg-gray-50 rounded-xl">
                            <Globe size={16} className="text-gray-400" />
                            <span>blog.bigshen.com</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
