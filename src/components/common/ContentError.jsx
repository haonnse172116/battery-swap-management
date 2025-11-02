import React from 'react';
import { useNavigate } from 'react-router-dom';

const ICONS = {
  '403': (
    <svg className="w-16 h-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
    </svg>
  ),
  '404': (
    <svg className="w-16 h-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
    </svg>
  ),
  error: (
    <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
    </svg>
  ),
};

const ContentError = ({ type, error, onRetry, title, subTitle }) => {
  const navigate = useNavigate();

  let errorType = 'api';
  let errorTitle = 'Có lỗi xảy ra';
  let errorSubTitle = 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.';

  if (type) {
    errorType = type;
    const errorConfig = {
      '403': {
        title: '403',
        subTitle: 'Xin lỗi, bạn không có quyền truy cập chức năng này.',
      },
      '404': {
        title: '404',
        subTitle: 'Xin lỗi, trang bạn truy cập không tồn tại.',
      },
      api: {
        title: 'Có lỗi xảy ra',
        subTitle: 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.',
      },
    };

    errorTitle = errorConfig[errorType].title;
    errorSubTitle = errorConfig[errorType].subTitle;
  }

  if (title) errorTitle = title;
  if (subTitle) errorSubTitle = subTitle;

  if (error && !title && !subTitle) {
    if (error.message) {
      errorSubTitle = error.message;
    } else if (error.data?.errorMessage) {
      errorSubTitle = error.data.errorMessage;
    }
  }

  const getStatusIcon = () => {
    if (errorType === '403') return ICONS['403'];
    if (errorType === '404') return ICONS['404'];
    return ICONS['error'];
  };

  const renderActions = () => {
    if (errorType === 'api' && onRetry) {
      return (
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition"
          onClick={onRetry}
        >
          Thử lại
        </button>
      );
    }
    return (
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition"
        onClick={() => navigate('/')}
      >
        Trang chủ
      </button>
    );
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-blue-500 overflow-hidden">
      {/* Accent background */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70
        bg-[radial-gradient(800px_400px_at_15%_25%,rgba(59,130,246,0.18),transparent_60%),radial-gradient(600px_300px_at_85%_75%,rgba(29,78,216,0.30),transparent_60%)]" />

      <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-8 w-full max-w-md mx-auto border border-blue-100 flex flex-col items-center">
        {getStatusIcon()}
        <h2 className="mt-4 text-2xl font-bold text-blue-700">{errorTitle}</h2>
        <p className="mt-2 text-gray-700 text-center">{errorSubTitle}</p>
        <div className="mt-6">{renderActions()}</div>
      </div>
    </div>
  );
};

export default ContentError;
