import React from 'react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-900',
          borderColor: 'border-green-700',
          iconBg: 'bg-green-600',
          icon: '✓'
        };
      case 'error':
        return {
          bgColor: 'bg-red-900',
          borderColor: 'border-red-700',
          iconBg: 'bg-red-600',
          icon: '✕'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-900',
          borderColor: 'border-yellow-700',
          iconBg: 'bg-yellow-600',
          icon: '⚠'
        };
      case 'info':
        return {
          bgColor: 'bg-blue-900',
          borderColor: 'border-blue-700',
          iconBg: 'bg-blue-600',
          icon: 'ℹ'
        };
      default:
        return {
          bgColor: 'bg-gray-900',
          borderColor: 'border-gray-700',
          iconBg: 'bg-gray-600',
          icon: 'ℹ'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${styles.bgColor} ${styles.borderColor} rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 border transform transition-all duration-300 scale-100`}>
        <div className="flex items-start">
          <div className={`${styles.iconBg} rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0`}>
            <span className="text-white text-xl font-bold">{styles.icon}</span>
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
