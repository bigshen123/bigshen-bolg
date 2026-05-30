import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    icon?: ReactNode;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit';
}

const variantStyles = {
    primary: 'cartoon-btn-primary',
    secondary: 'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30',
    outline: 'border-2 border-current bg-transparent hover:bg-gray-50',
};

const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
};

/**
 * 卡通风格按钮组件
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    className = '',
    onClick,
    disabled = false,
    type = 'button',
}: ButtonProps) => {
    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`cartoon-btn ${variantStyles[variant]} ${sizeStyles[size]} 
                       flex items-center justify-center gap-2 ${className}
                       ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileHover={disabled ? {} : { scale: 1.05 }}
            whileTap={disabled ? {} : { scale: 0.95 }}
        >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
        </motion.button>
    );
};

export default Button;
