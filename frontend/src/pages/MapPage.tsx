import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navigation, Loader2 } from 'lucide-react';
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

const CITY_COORDS: Record<string, { lat: number; lng: number; emoji: string }> = {
    '小樽': { lat: 43.2, lng: 141.0, emoji: '🌸' },
    '北海道': { lat: 43.06, lng: 141.35, emoji: '⛄' },
    '京都': { lat: 35.01, lng: 135.77, emoji: '🍁' },
    '山梨县': { lat: 35.60, lng: 138.57, emoji: '🗻' },
    '巴厘岛': { lat: -8.34, lng: 115.09, emoji: '🏝️' },
    '清迈': { lat: 18.79, lng: 98.98, emoji: '🛕' },
    '丽江': { lat: 26.86, lng: 100.23, emoji: '🏮' },
    '垦丁': { lat: 21.95, lng: 120.77, emoji: '🌊' },
    '敦煌': { lat: 40.05, lng: 94.67, emoji: '🏜️' },
    '厦门': { lat: 24.46, lng: 118.08, emoji: '🌴' },
    '巴黎': { lat: 48.86, lng: 2.35, emoji: '🗼' },
    '格林德瓦': { lat: 46.62, lng: 8.04, emoji: '🏔️' },
};

/**
 * 地图页面 - 使用 Leaflet 原生 API
 */
const MapPage = () => {
    const navigate = useNavigate();
    const { config } = useThemeContext();
    const [spots, setSpots] = useState<TravelSpot[]>([]);
    const [loading, setLoading] = useState(true);
    const [mapError, setMapError] = useState(false);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    // 加载旅行数据
    useEffect(() => {
        const loadTravelData = async () => {
            try {
                setLoading(true);
                const result = await articleService.getArticles(0, 100);
                if (result) {
                    const data = result as unknown as { content: Article[] };
                    const articles = data.content || [];
                    const cityMap = new Map<string, { country: string; count: number }>();
                    articles.forEach((a) => {
                        if (a.location) {
                            const parts = a.location.split(/[·\s]+/);
                            const cityName = parts.length > 1 ? parts.slice(1).join('') : a.location;
                            const cityKey = cityName || a.location;
                            const existing = cityMap.get(cityKey);
                            if (existing) {
                                existing.count++;
                            } else {
                                cityMap.set(cityKey, { country: parts[0] || '', count: 1 });
                            }
                        }
                    });
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
                    setSpots(travelSpots);
                }
            } catch (err) {
                console.error('加载旅行足迹失败:', err);
            } finally {
                setLoading(false);
            }
        };
        loadTravelData();
    }, []);

    // 初始化 Leaflet 地图（不依赖 react-leaflet，避免 ESM 兼容问题）
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        let cancelled = false;

        const initMap = async () => {
            try {
                // 动态导入 Leaflet CSS
                await import('leaflet/dist/leaflet.css');

                const L = (await import('leaflet')).default;

                if (cancelled || !mapContainerRef.current) return;

                const map = L.map(mapContainerRef.current, {
                    center: [30, 110],
                    zoom: 3,
                    zoomControl: false,
                    attributionControl: false,
                });

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors',
                }).addTo(map);

                mapInstanceRef.current = map;

                // 添加标记
                if (spots.length > 0) {
                    const bounds = L.latLngBounds(
                        spots.map((s) => [s.lat, s.lng] as L.LatLngExpression)
                    );

                    spots.forEach((spot) => {
                        const icon = L.divIcon({
                            html: `<div style="
                                width:36px;height:36px;border-radius:50%;
                                background:linear-gradient(135deg,${config.colors.primary},#4ECDC4);
                                display:flex;align-items:center;justify-content:center;
                                font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.25);
                                border:2px solid white;
                            ">${spot.emoji}</div>`,
                            className: '',
                            iconSize: [36, 36],
                            iconAnchor: [18, 18],
                        });

                        L.marker([spot.lat, spot.lng], { icon })
                            .addTo(map)
                            .bindPopup(`
                                <div style="text-align:center;min-width:120px">
                                    <div style="font-size:16px;font-weight:bold;color:#1f2937">
                                        ${spot.emoji} ${spot.name}
                                    </div>
                                    <div style="font-size:12px;color:#6b7280">${spot.country}</div>
                                    <div style="font-size:12px;color:#ec4899;margin-top:4px">
                                        ${spot.articles} 篇文章
                                    </div>
                                </div>
                            `);
                    });

                    if (spots.length === 1) {
                        map.setView([spots[0].lat, spots[0].lng], 5);
                    } else {
                        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
                    }
                }
            } catch (err) {
                console.error('地图初始化失败:', err);
                if (!cancelled) setMapError(true);
            }
        };

        initMap();

        return () => {
            cancelled = true;
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [spots, config.colors.primary]);

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
            <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    🗺️ 旅行地图
                </h1>
                <p className="text-gray-500">记录我去过的每一个地方</p>
            </motion.div>

            {/* 地图 */}
            <motion.div
                className="rounded-3xl overflow-hidden mb-8 shadow-lg bg-gray-100 relative"
                style={{ height: '420px' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                {mapError ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <p>地图加载失败，请刷新页面重试</p>
                    </div>
                ) : (
                    <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
                )}
            </motion.div>

            {/* 统计 */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { label: '去过国家', value: String(uniqueCountries), emoji: '🌍' },
                    { label: '旅行城市', value: String(totalCities), emoji: '🏙️' },
                    { label: '旅行文章', value: String(totalArticles), emoji: '📝' },
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

            {/* 清单 */}
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
                                onClick={() => navigate(`/category/${spot.country}`)}
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
