import hotToast from 'react-hot-toast';

// ✅ Create toast object with simple methods
const toast = {
  success: (message, options = {}) => {
    return hotToast.success(message, {
      duration: 4000,
      ...options,
    });
  },

  error: (message, options = {}) => {
    return hotToast.error(message, {
      duration: 5000,
      ...options,
    });
  },

  loading: (message = 'Đang xử lý...', options = {}) => {
    return hotToast.loading(message, {
      duration: Infinity,
      ...options,
    });
  },

  info: (message, options = {}) => {
    return hotToast(message, {
      icon: '💡',
      duration: 4000,
      style: {
        background: '#f0f9ff',
        color: '#1e40af',
        border: '1px solid #dbeafe',
      },
      ...options,
    });
  },

  warning: (message, options = {}) => {
    return hotToast(message, {
      icon: '⚠️',
      duration: 4500,
      style: {
        background: '#fffbeb',
        color: '#d97706',
        border: '1px solid #fed7aa',
      },
      ...options,
    });
  },

  // ✅ Utility methods
  dismiss: (toastId) => {
    return hotToast.dismiss(toastId);
  },

  dismissAll: () => {
    return hotToast.dismiss();
  },

  promise: (promise, msgs, options = {}) => {
    return hotToast.promise(promise, msgs, options);
  },
};

export default toast;