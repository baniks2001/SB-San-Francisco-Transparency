import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  isLoading = false
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          bgColor: 'bg-red-900',
          borderColor: 'border-red-700',
          iconBg: 'bg-red-600',
          icon: '⚠',
          confirmBg: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-900',
          borderColor: 'border-yellow-700',
          iconBg: 'bg-yellow-600',
          icon: '⚠',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'info':
        return {
          bgColor: 'bg-blue-900',
          borderColor: 'border-blue-700',
          iconBg: 'bg-blue-600',
          icon: 'ℹ',
          confirmBg: 'bg-blue-600 hover:bg-blue-700'
        };
      default:
        return {
          bgColor: 'bg-gray-900',
          borderColor: 'border-gray-700',
          iconBg: 'bg-gray-600',
          icon: 'ℹ',
          confirmBg: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const styles = getTypeStyles();

  const handleConfirm = () => {
    onConfirm();
  };

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
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 ${styles.confirmBg} text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
