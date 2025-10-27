import { CpuChipIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export const BatteryLoadingState = () => (
  <div className="p-12 text-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <div className="space-y-2">
        <p className="text-lg font-medium text-gray-900">Đang tải dữ liệu...</p>
        <p className="text-sm text-gray-500">Vui lòng đợi trong giây lát</p>
      </div>
    </div>
  </div>
);

export const BatteryErrorState = ({ onRetry }) => (
  <div className="p-12 text-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
        <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-medium text-gray-900">Có lỗi khi tải dữ liệu</p>
        <p className="text-sm text-gray-500">Vui lòng thử lại hoặc liên hệ hỗ trợ kỹ thuật</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thử lại
        </button>
      )}
    </div>
  </div>
);

export const BatteryEmptyState = ({ onAddBattery, hasFilters, onClearFilters }) => (
  <div className="p-12 text-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
        <CpuChipIcon className="w-8 h-8 text-gray-400" />
      </div>
      <div className="space-y-2">
        {hasFilters ? (
          <>
            <p className="text-lg font-medium text-gray-900">Không tìm thấy pin phù hợp</p>
            <p className="text-sm text-gray-500">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
          </>
        ) : (
          <>
            <p className="text-lg font-medium text-gray-900">Chưa có pin nào trong hệ thống</p>
            <p className="text-sm text-gray-500">Bắt đầu bằng cách thêm pin đầu tiên</p>
          </>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        {hasFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Xóa bộ lọc
          </button>
        )}
        {onAddBattery && (
          <button
            onClick={onAddBattery}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <CpuChipIcon className="w-4 h-4" />
            Thêm pin mới
          </button>
        )}
      </div>
    </div>
  </div>
);