import { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  color?: 'success' | 'error' | 'warning' | 'info' | 'default';
  variant?: 'solid' | 'outline';
  className?: string;
}

const colorClasses = {
  success: {
    solid: 'bg-green-100 text-green-800',
    outline: 'border-green-300 text-green-800',
  },
  error: {
    solid: 'bg-red-100 text-red-800',
    outline: 'border-red-300 text-red-800',
  },
  warning: {
    solid: 'bg-yellow-100 text-yellow-800',
    outline: 'border-yellow-300 text-yellow-800',
  },
  info: {
    solid: 'bg-blue-100 text-blue-800',
    outline: 'border-blue-300 text-blue-800',
  },
  default: {
    solid: 'bg-gray-100 text-gray-800',
    outline: 'border-gray-300 text-gray-800',
  },
};

export const Badge = ({
  children,
  color = 'default',
  variant = 'solid',
  className = '',
}: BadgeProps) => {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${variant === 'outline' ? 'border' : ''}
        ${colorClasses[color][variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

