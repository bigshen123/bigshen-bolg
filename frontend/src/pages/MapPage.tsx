import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Globe, Loader2 } from 'lucide-react';
import { useThemeContext } from '../components/theme/ThemeProvider';
import { articleService } from '../services/articleService';
import type { Article } from '../types/article';

interface TravelSpot {
    name: string;
    country: string;
    lat: number;
    lng: number;
    emoji: string;
    articles: number;
}

// 预设城市坐标映射（用于从 location 字段解析坐标）
const CITY_COORDS: Record<string, { lat: number; lng: number; emoji: string }> = {
    '小樽': { lat: 43.2, lng: 141.0, emoji: '🌸' },
    '北海道': { lat: 43.06, lng: 141.35, emoji: '⛄' },
    '巴厘岛': { lat: -8.34, lng: 115.09, emoji: '🏝️' },
    '丽江': { lat: 26.86, lng: 100.23, emoji: '🏮' },
    '垦丁': { lat: 21.95, lng: 120.77, emoji: '🌊' },
    '京都': { lat: 35.01, lng: 135.77, emoji: '🍁' },
    '敦煌': { lat: 40.05, lng: 94.67, emoji: '🏜️' },
    '清迈': { lat: 18.79, lng: 98.98, emoji: '🛕' },
    '巴黎': { lat: 48.86, lng: 2.35, emoji: '🗼' },
};

/**
 * 地图页面 - 展示旅行足迹（从文章数据动态生成）
 */
const MapPage = () => {
    const { config } = useThemeContext();
    const [spots, setSpots] = useState<TravelSpot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTravelData = async () => {
            try {
                setLoading(true);
                // 获取所有文章
                const result = await articleService.getArticles(0, 100);
                if (result) {
                    const data = result as unknown as { content: Article[] };
                    const articles = data.content || [];
                    // 按城市聚合统计
                    const cityMap = new Map<string, { country: string; count: number }>();
                    articles.forEach((a) => {
                        if (a.location) {
                            const cityName = a.location.replace(/^[^\s·]+[·\s]*/, ''); // 去掉国家前缀
                            const key = cityName || a.location;
                            const existing = cityMap.get(key);
                            if (existing) {
                                existing.count++;
                            } else {
                                cityMap.set(key, { country: a.location.split(/[·\s]/)[0] || '', count: 1 });
                            }
                        }
                    });

                    // 转换为 TravelSpot 列表
                    const travelSpots: TravelSpot[] = [];
                    cityMap.forEach((info, city) => {
                        const coord = CITY_COORDS[city];
                        if (coord) {
                            travelSpots.push({
                                name: city,
                                country: info.country,
                                lat: coord.lat,
                                lng: coord.lng,
                                emoji: coord.emoji,
                                articles: info.count,
                            });
                        }
                    });

                    // 如果后端无数据，使用模拟数据
                    if (travelSpots.length === 0) {
                        setSpots([
                            { name: '小樽', country: '日本', lat: 43.2, lng: 141.0, emoji: '🌸', articles: 3 },
                            { name: '巴厘岛', country: '印度尼西亚', lat: -8.34, lng: 115.09, emoji: '🏝️', articles: 2 },
                            { name: '丽江', country: '中国', lat: 26.86, lng: 100.23, emoji: '🏮', articles: 4 },
                            { name: '垦丁', country: '中国', lat: 21.95, lng: 120.77, emoji: '🌊', articles: 1 },
                            { name: '京都', country: '日本', lat: 35.01, lng: 135.77, emoji: '🍁', articles: 5 },
                            { name: '敦煌', country: '中国', lat: 40.05, lng: 94.67, emoji: '🏜️', articles: 2 },
                            { name: '清迈', country: '泰国', lat: 18.79, lng: 98.98, emoji: '🛕', articles: 1 },
                            { name: '巴黎', country: '法国', lat: 48.86, lng: 2.35, emoji: '🗼', articles: 2 },
                        ]);
                    } else {
                        setSpots(travelSpots);
                    }
                }
            } catch (err) {
                console.error('加载旅行足迹失败:', err);
            } finally {
                setLoading(false);
            }
        };
        loadTravelData();
    }, []);

    // 统计信息
    const uniqueCountries = new Set(spots.map((s) => s.country)).size;
    const totalCities = spots.length;
    const totalArticles = spots.reduce((sum, s) => sum + s.articles, 0);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-40">
                <Loader2 size={36} className="animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div>
            {/* 页面头部 */}
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    🗺️ 旅行地图
                </h1>
                <p className="text-gray-500">记录我去过的每一个地方</p>
            </motion.div>

            {/* 地图区域 */}
            <motion.div
                className="relative rounded-3xl overflow-hidden mb-8 h-72 md:h-96"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    background: `linear-gradient(135deg, ${config.colors.primary}20, ${config.colors.secondary}20, #E8F4FD)`,
                }}
            >
                {/* 装饰性世界地图背景 */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Globe size={200} className="text-gray-200 opacity-30" />
                </div>

                {/* 标记点 */}
                {spots.map((spot) => {
                    const top = `${20 + (spot.lat + 10) * 1.5}%`;
                    const left = `${10 + (spot.lng + 10) * 0.4}%`;

                    return (
                        <motion.div
                            key={spot.name}
                            className="absolute cursor-pointer group"
                            style={{ top, left }}
                            whileHover={{ scale: 1.5, zIndex: 10 }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: Math.random() * 0.5 }}
                        >
                            <div className="relative">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center
                                           shadow-lg text-lg animate-float"
                                    style={{
                                        background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary})`,
                                    }}
                                >
                                    {spot.emoji}
                                </div>
                                {/* 信息卡片 */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                                            bg-white rounded-xl shadow-lg p-3 whitespace-nowrap
                                            opacity-0 group-hover:opacity-100 transition-opacity
                                            pointer-events-none">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <MapPin size={12} className="text-pink-400" />
                                        <span className="text-sm font-medium">{spot.name}</span>
                                    </div>
                                    <div className="text-xs text-gray-400">{spot.country}</div>
                                    <div className="text-xs text-pink-400 mt-1">{spot.articles} 篇文章</div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* 统计信息 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: '去过国家', value: String(uniqueCountries), emoji: '🌍', color: '#74B9FF' },
                    { label: '旅行城市', value: String(totalCities), emoji: '🏙️', color: '#00B894' },
                    { label: '旅行文章', value: String(totalArticles), emoji: '📝', color: '#FDCB6E' },
                    { label: '旅行照片', value: '--', emoji: '📸', color: '#FF7675' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        className="bg-white rounded-2xl p-4 text-center shadow-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        whileHover={{ y: -4 }}
                    >
                        <div className="text-3xl mb-2">{stat.emoji}</div>
                        <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* 旅行清单 */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Navigation size={18} /> 旅行足迹清单
                </h2>
                {spots.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <p>还没有旅行记录，开始写一篇旅行日记吧~</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {spots.map((spot, i) => (
                            <motion.div
                                key={spot.name}
                                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50
                                         transition-colors cursor-pointer"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <span className="text-2xl">{spot.emoji}</span>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-800">{spot.name}</div>
                                    <div className="text-sm text-gray-400">{spot.country}</div>
                                </div>
                                <span className="text-sm text-pink-400">{spot.articles}篇</span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapPage;
