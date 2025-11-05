import React from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ArrowsUpDownIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

const PaymentFilters = ({ 
  statusFilter, 
  setStatusFilter,
  sortBy, 
  setSortBy,
  searchTerm, 
  setSearchTerm,
  onRefresh,
  isLoading,
  resultCount 
}) => {
  const statusOptions = [
    { key: 'all', label: 'Tất cả trạng thái' },
    { key: 'pending', label: 'Đang xử lý' },
    { key: 'completed', label: 'Thành công' },
    { key: 'failed', label: 'Thất bại' },
    { key: 'cancelled', label: 'Đã hủy' }
  ];

  const sortOptions = [
    { key: 'newest', label: 'Mới nhất' },
    { key: 'oldest', label: 'Cũ nhất' },
    { key: 'amount_high', label: 'Số tiền cao' },
    { key: 'amount_low', label: 'Số tiền thấp' }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã giao dịch, mã đặt lịch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="lg:w-48">
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
            >
              {statusOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort */}
        <div className="lg:w-48">
          <div className="relative">
            <ArrowsUpDownIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
            >
              {sortOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Làm mới</span>
        </button>
      </div>

      {/* Results count */}
      {resultCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Hiển thị <strong>{resultCount}</strong> kết quả
            {(searchTerm || statusFilter !== 'all') && (
              <span className="text-blue-600 ml-1">(đã lọc)</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentFilters;