import type { ThemeColors, AnimalCharacter } from '../types/theme';

/**
 * 生成随机HSL颜色
 */
export const generateRandomColor = (): string => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 65 + Math.floor(Math.random() * 20);
    const lightness = 50 + Math.floor(Math.random() * 15);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

/**
 * 生成一组主题颜色
 */
export const generateThemeColors = (): ThemeColors => {
    const primary = generateRandomColor();
    const secondary = generateRandomColor();

    return {
        primary,
        secondary,
        accent: generateRandomColor(),
        background: '#F9F7F7',
        text: '#333333',
        border: `${primary}40`,
    };
};

/**
 * 预设调色板
 */
export const PRESET_THEMES: ThemeColors[] = [
    {
        primary: '#FF6B8B',
        secondary: '#4ECDC4',
        accent: '#FFD166',
        background: '#F9F7F7',
        text: '#333333',
        border: '#FF6B8B40',
    },
    {
        primary: '#6C5CE7',
        secondary: '#FD79A8',
        accent: '#00CEC9',
        background: '#F9F7F7',
        text: '#333333',
        border: '#6C5CE740',
    },
    {
        primary: '#FDCB6E',
        secondary: '#E17055',
        accent: '#00B894',
        background: '#FFFAF0',
        text: '#333333',
        border: '#FDCB6E40',
    },
    {
        primary: '#74B9FF',
        secondary: '#A29BFE',
        accent: '#FF7675',
        background: '#F0F4FF',
        text: '#333333',
        border: '#74B9FF40',
    },
];

/**
 * 设置CSS变量应用主题
 */
export const applyTheme = (colors: ThemeColors): void => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-bg', colors.background);
    root.style.setProperty('--color-text', colors.text);
};

/**
 * 获取随机动物角色
 */
export const getRandomAnimal = (): AnimalCharacter => {
    const animals = getAnimalList();
    return animals[Math.floor(Math.random() * animals.length)];
};

/**
 * 获取动物角色列表
 */
export const getAnimalList = (): AnimalCharacter[] => {
    return [
        {
            id: 'bear-1',
            name: '旅行小熊',
            type: 'bear',
            color: '#8B4513',
            emoji: '🐻',
            description: '最喜欢在森林里露营的小熊',
        },
        {
            id: 'rabbit-1',
            name: '蹦蹦兔',
            type: 'rabbit',
            color: '#FFB6C1',
            emoji: '🐰',
            description: '爱拍照的旅行达人兔',
        },
        {
            id: 'cat-1',
            name: '喵旅者',
            type: 'cat',
            color: '#FFA500',
            emoji: '🐱',
            description: '慵懒但热爱探索世界的猫咪',
        },
        {
            id: 'dog-1',
            name: '旺旺探险家',
            type: 'dog',
            color: '#DAA520',
            emoji: '🐶',
            description: '永远充满活力的旅行伙伴',
        },
        {
            id: 'panda-1',
            name: '滚滚游记',
            type: 'panda',
            color: '#2F4F4F',
            emoji: '🐼',
            description: '慢悠悠走遍世界的熊猫',
        },
        {
            id: 'fox-1',
            name: '火狐迷踪',
            type: 'fox',
            color: '#FF4500',
            emoji: '🦊',
            description: '聪明机智的路线规划师',
        },
        {
            id: 'koala-1',
            name: '树袋旅人',
            type: 'koala',
            color: '#808080',
            emoji: '🐨',
            description: '享受慢旅行的考拉君',
        },
    ];
};
