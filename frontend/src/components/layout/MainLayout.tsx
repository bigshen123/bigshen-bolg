import { Outlet } from 'react-router-dom';
import { ThemeProvider } from '../theme/ThemeProvider';
import Header from '../common/Header';
import Footer from '../common/Footer';

/**
 * 主布局组件
 */
const MainLayout = () => {
    return (
        <ThemeProvider>
            <div className="min-h-screen flex flex-col bg-bg-warm">
                <Header />
                <main className="flex-1 pt-16 pb-20 md:pb-8">
                    <div className="max-w-6xl mx-auto px-4 py-6">
                        <Outlet />
                    </div>
                </main>
                <Footer />
            </div>
        </ThemeProvider>
    );
};

export default MainLayout;
