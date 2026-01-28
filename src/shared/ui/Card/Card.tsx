import { ReactNode } from 'react';

export interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  children: ReactNode;
  className?: string;
}

const variantClasses = {
  default: 'bg-white',
  outlined: 'bg-white border-2 border-gray-200',
  elevated: 'bg-white shadow-lg',
};

export const Card = ({
  title,
  subtitle,
  actions,
  variant = 'default',
  children,
  className = '',
}: CardProps) => {
  return (
    <div
      className={`
        rounded-lg shadow-md p-6
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

