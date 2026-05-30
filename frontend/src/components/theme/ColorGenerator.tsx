import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shuffle } from 'lucide-react';
import { useThemeContext } from './ThemeProvider';
import { generateThemeColors, PRESET_THEMES } from '../../utils/themeUtils';

/**
 * 随机色调生成器组件
 */
const ColorGenerator = () => {
    const { config, setTheme } = useThemeContext();
    const [showPresets, setShowPresets] = useState(false);

    const handleRandomize = () => {
        const newColors = generateThemeColors();
        setTheme(newColors);
    };

    return (
        <div className="p-4 bg-white rounded-2xl shadow-md">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>🎨</span> 主题配色
            </h3>

            {/* 当前颜色预览 */}
            <div className="flex gap-2 mb-3">
                {['primary', 'secondary', 'accent'].map((key) => (
                    <motion.div
                        key={key}
                        className="w-10 h-10 rounded-full shadow-sm border-2 border-white"
                        style={{
                            backgroundColor: config.colors[key as keyof typeof config.colors],
                        }}
                        whileHover={{ scale: 1.2 }}
                        title={key}
                    />
                ))}
            </div>

            {/* 随机按钮 */}
            <button
                onClick={handleRandomize}
                className="cartoon-btn cartoon-btn-primary flex items-center gap-2 text-sm py-2 px-4"
            >
                <Shuffle size={16} />
                随机换色
            </button>

            {/* 预设主题切换 */}
            <button
                onClick={() => setShowPresets(!showPresets)}
                className="mt-2 text-sm text-gray-500 hover:text-gray-700 underline"
            >
                {showPresets ? '收起预设' : '查看更多主题'}
            </button>

            {showPresets && (
                <motion.div
                    className="mt-3 grid grid-cols-2 gap-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                >
                    {PRESET_THEMES.map((preset, index) => (
                        <button
                            key={index}
                            onClick={() => setTheme(preset)}
                            className="flex gap-1 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            {['primary', 'secondary', 'accent'].map((key) => (
                                <div
                                    key={key}
                                    className="w-6 h-6 rounded-full"
                                    style={{
                                        backgroundColor: preset[key as keyof typeof preset],
                                    }}
                                />
                            ))}
                        </button>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default ColorGenerator;
