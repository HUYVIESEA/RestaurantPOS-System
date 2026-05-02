import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info' | 'success';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <i className="fas fa-trash-can text-red-500 dark:text-red-400"></i>;
      case 'warning':
        return <i className="fas fa-triangle-exclamation text-yellow-500 dark:text-yellow-400"></i>;
      case 'info':
        return <i className="fas fa-info-circle text-blue-600 dark:text-blue-500"></i>;
      case 'success':
        return <i className="fas fa-circle-check text-green-500 dark:text-green-400"></i>;
      default:
        return <i className="fas fa-question-circle text-gray-500 dark:text-gray-400"></i>;
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500';
      case 'info':
        return 'bg-blue-700 hover:bg-blue-800 text-white focus:ring-blue-600';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500';
      default:
        return 'bg-blue-700 hover:bg-blue-800 text-white focus:ring-blue-600';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onCancel}>
      <div 
        className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-scale-in" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        <div className="px-6 py-5 sm:flex sm:items-start">
          <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
            type === 'danger' ? 'bg-red-100 dark:bg-red-900/30' :
            type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
            type === 'info' ? 'bg-blue-100 dark:bg-blue-900/30' :
            'bg-green-100 dark:bg-green-900/30'
          }`}>
            <span className="text-xl">{getIcon()}</span>
          </div>
          <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
            <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white" id="modal-headline">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {message}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-slate-700/50 px-6 py-4 sm:flex sm:flex-row-reverse gap-3 border-t border-gray-200 dark:border-gray-700">
          <button 
            type="button"
            className={`inline-flex w-full justify-center rounded-md px-4 py-2.5 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto sm:text-sm transition-colors ${getConfirmButtonClass()}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button 
            type="button"
            className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-slate-700 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-slate-600 sm:mt-0 sm:w-auto sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
