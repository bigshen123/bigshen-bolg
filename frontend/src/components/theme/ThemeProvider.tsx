import { createContext, useContext, type ReactNode } from 'react';
import { useTheme } from '../../hooks/useTheme';
import type { ThemeColors, ThemeConfig, AnimalCharacter } from '../../types/theme';

interface ThemeContextType {
    config: ThemeConfig;
    randomizeTheme: () => void;
    setTheme: (colors: ThemeColors) => void;
    setAnimal: (animal: AnimalCharacter) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const theme = useTheme();

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};
