import { Routes, Route } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import GalleryPage from './pages/GalleryPage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';

function App() {
    // 初始化主题
    useTheme();

    return (
        <Routes>
            {/* 登录页面独立布局 */}
            <Route path="/login" element={<LoginPage />} />
            {/* 主布局 */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/article/:id" element={<ArticlePage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Route>
        </Routes>
    );
}

export default App;
