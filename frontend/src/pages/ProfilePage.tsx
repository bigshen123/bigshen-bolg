import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Settings, Heart, BookOpen, FileText,
    Edit3, LogOut, Mail, Globe, Loader2, Lock,
} from 'lucide-react';
import { useThemeContext } from '../components/theme/ThemeProvider';
import AnimalAvatar from '../components/theme/AnimalAvatar';
import ColorGenerator from '../components/theme/ColorGenerator';
import Button from '../components/common/Button';
import { getAnimalList } from '../utils/themeUtils';
import { userService } from '../services/userService';
import { articleService } from '../services/articleService';
import { favoriteService } from '../services/favoriteService';
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
    const [activeTab, setActiveTab] = useState<'articles' | 'drafts' | 'likes' | 'settings'>('articles');

    const [user, setUser] = useState<User | null>(null);
    const [userArticles, setUserArticles] = useState<Article[]>([]);
    const [favorites, setFavorites] = useState<Article[]>([]);
    const [drafts, setDrafts] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [favLoading, setFavLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({ username: '', bio: '', email: '' });
    // 密码修改相关状态
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState('');

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
     * 加载用户的文章和草稿
     */
    useEffect(() => {
        const loadUserArticles = async () => {
            if (!user) return;
            try {
                // 获取所有状态的文章（包括草稿）
                const result = await articleService.getArticles(0, 100);
                if (result) {
                    const data = result as unknown as { content: Article[] };
                    const all = data.content || [];
                    setUserArticles(all.filter((a) => a.authorId === user.id && a.status === 'PUBLISHED'));
                    setDrafts(all.filter((a) => a.authorId === user.id && a.status === 'DRAFT'));
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
     * 加载我的收藏
     */
    const loadFavorites = async () => {
        if (!user) return;
        try {
            setFavLoading(true);
            const result = await favoriteService.getUserFavorites(user.id, 0, 50);
            if (result) {
                const data = result as unknown as { content: Article[] };
                setFavorites(data.content || []);
            }
        } catch (err) {
            console.error('加载收藏失败:', err);
        } finally {
            setFavLoading(false);
        }
    };

    /**
     * 切换标签时加载收藏
     */
    useEffect(() => {
        if (activeTab === 'likes' && user) {
            loadFavorites();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, user]);

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
     * 修改密码
     */
    const handleChangePassword = async () => {
        if (!user) return;
        const { oldPassword, newPassword, confirmPassword } = passwordForm;

        if (!oldPassword || !newPassword || !confirmPassword) {
            setPasswordMsg('请填写所有密码字段');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMsg('两次输入的新密码不一致');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordMsg('新密码长度不能少于6位');
            return;
        }

        try {
            setChangingPassword(true);
            setPasswordMsg('');
            await userService.changePassword(user.id, oldPassword, newPassword);
            setPasswordMsg('密码修改成功!');
            setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => {
                setShowPasswordForm(false);
                setPasswordMsg('');
            }, 1500);
        } catch (err) {
            setPasswordMsg('修改失败，请检查旧密码是否正确');
        } finally {
            setChangingPassword(false);
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
        { key: 'articles' as const, label: '我的文章', icon: <BookOpen size={16} /> },
        { key: 'drafts' as const, label: '我的草稿', icon: <FileText size={16} /> },
        { key: 'likes' as const, label: '我的收藏', icon: <Heart size={16} /> },
        { key: 'settings' as const, label: '账号设置', icon: <Settings size={16} /> },
    ];

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
            <div className="flex gap-1 mb-6 bg-white rounded-2xl p-1.5 shadow-sm overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-shrink-0 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
                                 text-sm font-medium transition-all ${
                            activeTab === tab.key
                                ? 'bg-pink-50 text-pink-500 shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.key === 'drafts' && drafts.length > 0 && (
                            <span className="text-xs bg-pink-100 text-pink-500 px-1.5 rounded-full">
                                {drafts.length}
                            </span>
                        )}
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

            {activeTab === 'drafts' && (
                drafts.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>暂无草稿</p>
                        <p className="text-sm mt-1">写文章时选择"存草稿"即可保存</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {drafts.map((article, i) => (
                            <motion.div
                                key={article.id}
                                className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer
                                         hover:shadow-md transition-all border-l-4 border-yellow-400"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -2 }}
                                onClick={() => navigate(`/article/${article.id}/edit`)}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">草稿</span>
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-2">{article.title}</h3>
                                <p className="text-xs text-gray-400">📅 {formatDate(article.createdAt)}</p>
                            </motion.div>
                        ))}
                    </div>
                )
            )}

            {activeTab === 'likes' && (
                favLoading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 size={24} className="animate-spin text-gray-400" />
                    </div>
                ) : favorites.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <Heart size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>还没有收藏任何文章哦~</p>
                        <p className="text-sm mt-1">快去发现精彩的旅行故事吧</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {favorites.map((article, i) => (
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
                                    <span>{article.authorName}</span>
                                    <span>📅 {formatDate(article.createdAt)}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )
            )}

            {activeTab === 'settings' && (
                <div className="space-y-6">
                    {/* 修改密码 */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Lock size={16} /> 修改密码
                        </h3>
                        {!showPasswordForm ? (
                            <button
                                onClick={() => setShowPasswordForm(true)}
                                className="text-sm text-pink-500 hover:text-pink-600 px-3 py-1.5 rounded-lg
                                         hover:bg-pink-50 transition-colors"
                            >
                                点击修改密码
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <input
                                    type="password"
                                    placeholder="旧密码"
                                    value={passwordForm.oldPassword}
                                    onChange={(e) => setPasswordForm((f) => ({ ...f, oldPassword: e.target.value }))}
                                    className="w-full px-3 py-2 bg-gray-50 rounded-xl text-sm outline-none
                                             border-2 border-transparent focus:border-pink-200"
                                />
                                <input
                                    type="password"
                                    placeholder="新密码（至少6位）"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                                    className="w-full px-3 py-2 bg-gray-50 rounded-xl text-sm outline-none
                                             border-2 border-transparent focus:border-pink-200"
                                />
                                <input
                                    type="password"
                                    placeholder="确认新密码"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                                    className="w-full px-3 py-2 bg-gray-50 rounded-xl text-sm outline-none
                                             border-2 border-transparent focus:border-pink-200"
                                />
                                {passwordMsg && (
                                    <p className={`text-xs ${passwordMsg.includes('成功') ? 'text-green-500' : 'text-red-500'}`}>
                                        {passwordMsg}
                                    </p>
                                )}
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={handleChangePassword}
                                        disabled={changingPassword}
                                    >
                                        {changingPassword ? '修改中...' : '确认修改'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setShowPasswordForm(false);
                                            setPasswordMsg('');
                                            setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                                        }}
                                    >
                                        取消
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

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
