/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    pink: '#FF6B8B',
                    teal: '#4ECDC4',
                    yellow: '#FFD166',
                    green: '#06D6A0',
                    blue: '#118AB2',
                },
                bg: {
                    warm: '#F9F7F7',
                    cream: '#FFFAF0',
                },
                functional: {
                    error: '#FF4757',
                    success: '#2ED573',
                    warning: '#FFA502',
                    info: '#3742FA',
                },
            },
            fontFamily: {
                sans: [
                    'PingFang SC',
                    'Hiragino Sans GB',
                    'Microsoft YaHei',
                    'system-ui',
                    'sans-serif',
                ],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
            animation: {
                'bounce-slow': 'bounce 2s infinite',
                'float': 'float 3s ease-in-out infinite',
                'wiggle': 'wiggle 1s ease-in-out infinite',
                'scale-in': 'scaleIn 0.3s ease-out',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                wiggle: {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.9)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },
        },
    },
    plugins: [
        require('tailwindcss-animate'),
    ],
};
