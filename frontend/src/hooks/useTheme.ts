import { useState, useEffect, useCallback } from 'react';
import type { ThemeColors, ThemeConfig, AnimalCharacter } from '../types/theme';
import { generateThemeColors, applyTheme, getRandomAnimal, PRESET_THEMES } from '../utils/themeUtils';

/**
 * 主题管理Hook
 */
export const useTheme = () => {
    const [config, setConfig] = useState<ThemeConfig>(() => {
        const saved = localStorage.getItem('blog-theme');
        if (saved) {
            const parsed = JSON.parse(saved);
            applyTheme(parsed.colors);
            return parsed;
        }
        const defaultConfig: ThemeConfig = {
            colors: PRESET_THEMES[0],
            animalCharacter: getRandomAnimal(),
        };
        localStorage.setItem('blog-theme', JSON.stringify(defaultConfig));
        applyTheme(defaultConfig.colors);
        return defaultConfig;
    });

    const randomizeTheme = useCallback(() => {
        const newConfig: ThemeConfig = {
            colors: generateThemeColors(),
            animalCharacter: getRandomAnimal(),
        };
        setConfig(newConfig);
        localStorage.setItem('blog-theme', JSON.stringify(newConfig));
        applyTheme(newConfig.colors);
    }, []);

    const setTheme = useCallback((colors: ThemeColors) => {
        setConfig((prev) => {
            const newConfig = { ...prev, colors };
            localStorage.setItem('blog-theme', JSON.stringify(newConfig));
            return newConfig;
        });
        applyTheme(colors);
    }, []);

    const setAnimal = useCallback((animal: AnimalCharacter) => {
        setConfig((prev) => {
            const newConfig = { ...prev, animalCharacter: animal };
            localStorage.setItem('blog-theme', JSON.stringify(newConfig));
            return newConfig;
        });
    }, []);

    useEffect(() => {
        applyTheme(config.colors);
    }, []);

    return {
        config,
        randomizeTheme,
        setTheme,
        setAnimal,
    };
};
