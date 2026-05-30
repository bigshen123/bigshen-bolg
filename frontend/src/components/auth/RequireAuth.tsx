import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

interface RequireAuthProps {
    children: ReactNode;
    requireAdmin?: boolean;
}

/**
 * 鉴权守卫组件
 * 未登录重定向到 /login，需要管理员但角色不符时重定向到首页
 */
const RequireAuth = ({ children, requireAdmin = false }: RequireAuthProps) => {
    const location = useLocation();

    const token = localStorage.getItem('blog-token');
    const userStr = localStorage.getItem('blog-user');

    // 未登录，重定向到登录页并记住来源路径
    if (!token || !userStr) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 需要管理员权限时检查角色
    if (requireAdmin) {
        try {
            const user = JSON.parse(userStr);
            if (user.role !== 'ADMIN') {
                return <Navigate to="/" replace />;
            }
        } catch {
            // 用户数据解析失败，重新登录
            localStorage.removeItem('blog-token');
            localStorage.removeItem('blog-user');
            return <Navigate to="/login" replace />;
        }
    }

    return <>{children}</>;
};

export default RequireAuth;
