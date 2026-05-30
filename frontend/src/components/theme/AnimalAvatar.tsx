import { motion } from 'framer-motion';
import type { AnimalCharacter } from '../../types/theme';

interface AnimalAvatarProps {
    animal: AnimalCharacter;
    size?: 'sm' | 'md' | 'lg';
    showName?: boolean;
    onClick?: () => void;
}

const sizeMap = {
    sm: 'w-10 h-10 text-2xl',
    md: 'w-14 h-14 text-3xl',
    lg: 'w-20 h-20 text-5xl',
};

/**
 * 动物角色头像组件
 */
const AnimalAvatar = ({ animal, size = 'md', showName = false, onClick }: AnimalAvatarProps) => {
    return (
        <motion.div
            className="flex flex-col items-center gap-1 cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
        >
            <div
                className={`${sizeMap[size]} rounded-full flex items-center justify-center shadow-lg border-2 border-white`}
                style={{
                    background: `linear-gradient(135deg, ${animal.color}40, ${animal.color}20)`,
                }}
            >
                <span className="drop-shadow-md">{animal.emoji}</span>
            </div>
            {showName && (
                <span className="text-xs font-medium text-gray-600">{animal.name}</span>
            )}
        </motion.div>
    );
};

export default AnimalAvatar;
