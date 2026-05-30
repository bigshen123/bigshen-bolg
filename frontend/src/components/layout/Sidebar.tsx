import { Link } from 'react-router-dom';
import { Heart, Bookmark, MapPin, TrendingUp } from 'lucide-react';
import ColorGenerator from '../theme/ColorGenerator';
import AnimalAvatar from '../theme/AnimalAvatar';
import { useThemeContext } from '../theme/ThemeProvider';
import { getAnimalList } from '../../utils/themeUtils';

/**
 * 侧边栏组件
 */
const Sidebar = () => {
    const { config, setAnimal } = useThemeContext();
    const animals = getAnimalList();

    const popularTags = ['日本', '海边', '美食', '露营', '城市漫步', '雪山', '古镇', '花海'];

    return (
        <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-20 space-y-4">
                {/* 用户卡片 */}
                <div className="bg-white rounded-2xl shadow-md p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <AnimalAvatar animal={config.animalCharacter} size="md" />
                        <div>
                            <h3 className="font-semibold text-gray-800">旅行小熊</h3>
                            <p className="text-xs text-gray-400">热爱生活的旅行者</p>
                        </div>
                    </div>
                    <div className="flex justify-around text-center text-sm py-2 border-t border-gray-100">
                        <div>
                            <div className="font-bold text-gray-800">12</div>
                            <div className="text-xs text-gray-400">文章</div>
                        </div>
                        <div>
                            <div className="font-bold text-gray-800">328</div>
                            <div className="text-xs text-gray-400">粉丝</div>
                        </div>
                        <div>
                            <div className="font-bold text-gray-800">56</div>
                            <div className="text-xs text-gray-400">关注</div>
                        </div>
                    </div>
                </div>

                {/* 快捷导航 */}
                <div className="bg-white rounded-2xl shadow-md p-4">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <TrendingUp size={16} /> 快捷入口
                    </h4>
                    <nav className="space-y-1">
                        {[
                            { icon: <Heart size={15} />, label: '我的收藏', path: '/profile' },
                            { icon: <Bookmark size={15} />, label: '我的文章', path: '/profile' },
                            { icon: <MapPin size={15} />, label: '旅行足迹', path: '/map' },
                        ].map((item) => (
                            <Link
                                key={item.label}
                                to={item.path}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                                         text-gray-600 hover:bg-gray-50 hover:text-primary-pink transition-all"
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* 热门标签 */}
                <div className="bg-white rounded-2xl shadow-md p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">🏷️ 热门标签</h4>
                    <div className="flex flex-wrap gap-2">
                        {popularTags.map((tag) => (
                            <Link
                                key={tag}
                                to={`/?tag=${tag}`}
                                className="cartoon-tag bg-teal-50 text-teal-600 text-xs hover:bg-teal-100"
                            >
                                #{tag}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* 主题配色 */}
                <ColorGenerator />

                {/* 动物角色选择 */}
                <div className="bg-white rounded-2xl shadow-md p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">🐾 选择你的旅行伙伴</h4>
                    <div className="grid grid-cols-4 gap-2">
                        {animals.slice(0, 6).map((animal) => (
                            <button
                                key={animal.id}
                                onClick={() => setAnimal(animal)}
                                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all
                                    ${config.animalCharacter.id === animal.id
                                        ? 'bg-pink-50 ring-2 ring-pink-300'
                                        : 'hover:bg-gray-50'}`}
                            >
                                <span className="text-2xl">{animal.emoji}</span>
                                <span className="text-xs text-gray-500 truncate w-full text-center">
                                    {animal.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
