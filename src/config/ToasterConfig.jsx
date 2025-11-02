import { Toaster } from 'react-hot-toast';

const ToasterConfig = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName="toaster-container"
      containerStyle={{
        zIndex: 9999,
        top: '20px',
        right: '20px',
      }}
      toastOptions={{
        // ✅ Professional Default Styling
        className: 'battery-swap-toast',
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#1f2937',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '16px 20px',
          fontSize: '14px',
          fontWeight: '500',
          lineHeight: '1.5',
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          maxWidth: '400px',
          minWidth: '300px',
        },
        
        // ✅ Success Toast
        success: {
          duration: 4000,
          style: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
            boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.1), 0 4px 6px -2px rgba(34, 197, 94, 0.05)',
          },
          iconTheme: {
            primary: '#22c55e',
            secondary: '#f0fdf4',
          },
        },
        
        // ✅ Error Toast
        error: {
          duration: 5000,
          style: {
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.1), 0 4px 6px -2px rgba(239, 68, 68, 0.05)',
          },
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fef2f2',
          },
        },
        
        // ✅ Loading Toast
        loading: {
          style: {
            background: '#f0f9ff',
            color: '#1e40af',
            border: '1px solid #dbeafe',
            boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05)',
          },
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#f0f9ff',
          },
        },
      }}
    />
  );
};

export default ToasterConfig;