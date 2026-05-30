import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Image, Map, User } from 'lucide-react';
import { useThemeContext } from '../theme/ThemeProvider';

const BOTTOM_NAV = [
    { path: '/', label: '首页', icon: <Home size={22} /> },
    { path: '/gallery', label: '相册', icon: <Image size={22} /> },
    { path: '/map', label: '地图', icon: <Map size={22} /> },
    { path: '/profile', label: '我的', icon: <User size={22} /> },
];

/**
 * 底部导航栏组件（移动端）
 */
const Footer = () => {
    const { config } = useThemeContext();

    return (
        <footer className="md:hidden fixed bottom-0 left-0 right-0 z-50">
            <div
                className="h-16 mx-2 mb-2 rounded-2xl shadow-lg flex items-center justify-around px-2"
                style={{
                    background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary})`,
                }}
            >
                {BOTTOM_NAV.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className="flex flex-col items-center gap-0.5 text-white/80
                                 hover:text-white transition-colors"
                    >
                        <motion.div whileTap={{ scale: 0.8 }}>
                            {item.icon}
                        </motion.div>
                        <span className="text-xs">{item.label}</span>
                    </Link>
                ))}
            </div>
        </footer>
    );
};

export default Footer;
