import { ReactNode } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'elevated';
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className = '',
  variant = 'default',
  hover = false,
  onClick
}: CardProps) {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'glass':
        return {
          backgroundColor: `${theme.card}dd`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: `1px solid ${theme.border}40`,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
        };
      case 'elevated':
        return {
          backgroundColor: theme.card,
          border: `1px solid ${theme.border}`,
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.4)',
        };
      default:
        return {
          backgroundColor: theme.card,
          border: `1px solid ${theme.border}`,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        };
    }
  };

  const hoverClasses = hover ? 'transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`rounded-2xl p-6 ${hoverClasses} ${clickableClasses} ${className}`}
      style={getVariantStyles()}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
