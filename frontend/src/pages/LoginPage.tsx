import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useThemeContext } from '../components/theme/ThemeProvider';
import { userService } from '../services/userService';

/**
 * 登录/注册页面
 */
const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { config } = useThemeContext();

    // 获取重定向来源页面
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    /**
     * 提交表单
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password.trim()) {
            setError('请填写用户名和密码');
            return;
        }
        if (!isLogin && !email.trim()) {
            setError('请填写邮箱');
            return;
        }

        try {
            setLoading(true);
            let result;
            if (isLogin) {
                result = await userService.login({
                    username: username.trim(),
                    password: password.trim(),
                });
            } else {
                result = await userService.register({
                    username: username.trim(),
                    email: email.trim(),
                    password: password.trim(),
                });
            }

            if (result) {
                // 保存 token 和用户信息到 localStorage
                localStorage.setItem('blog-token', result.token);
                localStorage.setItem('blog-user', JSON.stringify(result.user));
                // 登录成功后跳回来源页面
                navigate(from, { replace: true });
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setError(axiosErr?.response?.data?.message || '操作失败，请稍后再试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <motion.div
                className="w-full max-w-md"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* 头部装饰 */}
                <div className="text-center mb-8">
                    <motion.div
                        className="text-5xl mb-4 inline-block"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                    >
                        {config.animalCharacter.emoji}
                    </motion.div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">
                        {isLogin ? '欢迎回来' : '加入我们'}
                    </h1>
                    <p className="text-gray-400 text-sm">
                        {isLogin
                            ? '继续你的旅行记录之旅'
                            : '开始记录你的旅行故事'}
                    </p>
                </div>

                {/* 表单卡片 */}
                <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* 用户名 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                用户名
                            </label>
                            <div className="relative">
                                <User
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="请输入用户名"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl text-sm
                                             outline-none border-2 border-transparent
                                             focus:border-pink-200 transition-all"
                                />
                            </div>
                        </div>

                        {/* 邮箱（仅注册） */}
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                    邮箱
                                </label>
                                <div className="relative">
                                    <Mail
                                        size={16}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="请输入邮箱"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl text-sm
                                                 outline-none border-2 border-transparent
                                                 focus:border-pink-200 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {/* 密码 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                密码
                            </label>
                            <div className="relative">
                                <Lock
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="请输入密码"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl text-sm
                                             outline-none border-2 border-transparent
                                             focus:border-pink-200 transition-all"
                                />
                            </div>
                        </div>

                        {/* 错误提示 */}
                        {error && (
                            <motion.p
                                className="text-red-400 text-sm text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                {error}
                            </motion.p>
                        )}

                        {/* 提交按钮 */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl
                                     text-white font-medium transition-all disabled:opacity-60"
                            style={{
                                background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary})`,
                            }}
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? '登录' : '注册'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* 切换登录/注册 */}
                    <div className="mt-6 text-center">
                        <span className="text-sm text-gray-400">
                            {isLogin ? '还没有账号？' : '已有账号？'}
                        </span>
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="ml-1 text-sm font-medium text-pink-400 hover:text-pink-500"
                        >
                            {isLogin ? '立即注册' : '去登录'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
