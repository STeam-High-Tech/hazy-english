// src/components/Notification.tsx
import { XMarkIcon } from '@heroicons/react/24/outline';

type NotificationProps = {
  message: string;
  onDismiss: () => void;
  type?: 'error' | 'success' | 'info' | 'warning';
};

export function Notification({ message, onDismiss, type = 'error' }: NotificationProps) {
  if (!message) return null;

  const typeStyles = {
    error: {
      bg: 'bg-tokyo-night-red/10',
      text: 'text-tokyo-night-red',
      icon: (
        <svg className="h-5 w-5 text-tokyo-night-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    success: {
      bg: 'bg-tokyo-night-green/10',
      text: 'text-tokyo-night-green',
      icon: (
        <svg className="h-5 w-5 text-tokyo-night-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    info: {
      bg: 'bg-tokyo-night-blue/10',
      text: 'text-tokyo-night-blue',
      icon: (
        <svg className="h-5 w-5 text-tokyo-night-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-tokyo-night-yellow/10',
      text: 'text-tokyo-night-yellow',
      icon: (
        <svg className="h-5 w-5 text-tokyo-night-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  };

  const currentType = typeStyles[type];

  return (
    <div 
      className={`relative mt-4 rounded-lg p-4 ${currentType.bg} border border-tokyo-night-comment/10 backdrop-blur-sm`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          {currentType.icon}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${currentType.text}`}>
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            type="button"
            onClick={onDismiss}
            className={`inline-flex rounded-md p-1 ${currentType.text} hover:bg-tokyo-night-bg3/50 focus:outline-none focus:ring-2 focus:ring-tokyo-night-blue/50 focus:ring-offset-2 focus:ring-offset-tokyo-night-bg2 transition-colors`}
            aria-label="Dismiss"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}