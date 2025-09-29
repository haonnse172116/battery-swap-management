import React from 'react';
import { useNavigate } from 'react-router-dom';

const ICONS = {
  '403': (
    <svg
      className="w-16 h-16 text-yellow-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
      />
    </svg>
  ),
  '404': (
    <svg
      className="w-16 h-16 text-blue-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
      />
    </svg>
  ),
  error: (
    <svg
      className="w-16 h-16 text-red-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
      />
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
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={onRetry}
        >
          Thử lại
        </button>
      );
    }
    return (
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={() => navigate('/')}
      >
        Trang chủ
      </button>
    );
  };

  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8 flex flex-col items-center">
        {getStatusIcon()}
        <h2 className="mt-4 text-2xl font-bold">{errorTitle}</h2>
        <p className="mt-2 text-gray-600 text-center">{errorSubTitle}</p>
        <div className="mt-6">{renderActions()}</div>
      </div>
    </div>
  );
};

export default ContentError;
