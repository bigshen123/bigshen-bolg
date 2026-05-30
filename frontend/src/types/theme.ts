// 主题相关类型定义

export interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
}

export interface AnimalCharacter {
    id: string;
    name: string;
    type: 'bear' | 'rabbit' | 'cat' | 'dog' | 'panda' | 'fox' | 'koala';
    color: string;
    emoji: string;
    description: string;
}

export interface ThemeConfig {
    colors: ThemeColors;
    animalCharacter: AnimalCharacter;
}
