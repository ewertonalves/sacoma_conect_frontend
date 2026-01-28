import { Loader2 } from 'lucide-react';

export interface LoadingProps {
  variant?: 'spinner' | 'skeleton' | 'progress';
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  message?: string;
}

const sizeClasses = {
  small: 'w-4 h-4',
  medium: 'w-8 h-8',
  large: 'w-12 h-12',
};

export const Loading = ({
  variant = 'spinner',
  size = 'medium',
  fullScreen = false,
  message,
}: LoadingProps) => {
  if (variant === 'spinner') {
    const content = (
      <div className="flex flex-col items-center justify-center gap-2">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
    );

    if (fullScreen) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
          {content}
        </div>
      );
    }

    return <div className="flex items-center justify-center p-4">{content}</div>;
  }

  if (variant === 'skeleton') {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 animate-pulse" style={{ width: '50%' }}></div>
      </div>
    </div>
  );
};

