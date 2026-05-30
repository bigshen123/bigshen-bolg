import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/theme/ThemeProvider';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import RequireAuth from './components/auth/RequireAuth';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import ArticleEditPage from './pages/ArticleEditPage';
import GalleryPage from './pages/GalleryPage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import CategoryPage from './pages/CategoryPage';
import FavoritesPage from './pages/FavoritesPage';
import NotificationPage from './pages/NotificationPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminArticles from './pages/admin/AdminArticles';
import AdminCategories from './pages/admin/AdminCategories';
import AdminComments from './pages/admin/AdminComments';
import AdminUsers from './pages/admin/AdminUsers';

function App() {
    return (
        <ThemeProvider>
            <Routes>
                {/* 登录页面（无需鉴权） */}
                <Route path="/login" element={<LoginPage />} />
                {/* 管理员后台（需要管理员角色） */}
                <Route
                    path="/admin"
                    element={
                        <RequireAuth requireAdmin>
                            <AdminLayout />
                        </RequireAuth>
                    }
                >
                    <Route index element={<AdminDashboard />} />
                    <Route path="articles" element={<AdminArticles />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="comments" element={<AdminComments />} />
                    <Route path="users" element={<AdminUsers />} />
                </Route>
                {/* 主布局（需要登录） */}
                <Route
                    element={
                        <RequireAuth>
                            <MainLayout />
                        </RequireAuth>
                    }
                >
                    <Route path="/" element={<HomePage />} />
                    <Route path="/article/new" element={<ArticleEditPage />} />
                    <Route path="/article/:id" element={<ArticlePage />} />
                    <Route path="/article/:id/edit" element={<ArticleEditPage />} />
                    <Route path="/category/:name" element={<CategoryPage />} />
                    <Route path="/gallery" element={<GalleryPage />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/notifications" element={<NotificationPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Route>
                {/* 默认重定向到首页 */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </ThemeProvider>
    );
}

export default App;
