import React, { useState, useEffect, useMemo } from 'react';
import { 
  BoltIcon, 
  MapPinIcon, 
  TruckIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CreditCardIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import toast from '../../../utils/toast';
import { useGetMySwapsQuery } from '../../../services/batterySwap.service';

const SwapsPage = () => {
  const [sortBy, setSortBy] = useState('newest');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { 
    data: swapsResponse, 
    isLoading, 
    error,
    refetch 
  } = useGetMySwapsQuery();

  const handleRefresh = () => {
    toast.info('🔄 Đang làm mới dữ liệu...');
    refetch();
  };

  useEffect(() => {
    if (error) {
      toast.error('❌ Không thể tải lịch sử thay pin');
    }
  }, [error]);

  const swaps = swapsResponse?.content || [];

  const filteredSwaps = useMemo(() => {
    if (statusFilter === 'all') return swaps;
    return swaps.filter(swap => swap.status?.toLowerCase() === statusFilter);
  }, [swaps, statusFilter]);

  // Sort swaps
  const sortedSwaps = useMemo(() => {
    const arr = [...filteredSwaps];
    switch (sortBy) {
      case 'newest':
        return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'recent_swap':
        return arr.sort((a, b) => new Date(b.swappedAt) - new Date(a.swappedAt));
      default:
        return arr;
    }
  }, [filteredSwaps, sortBy]);

  // Status configuration
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          label: 'Đang xử lý',
          color: 'yellow',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200',
          icon: ExclamationCircleIcon,
          iconColor: 'text-yellow-600'
        };
      case 'completed':
        return {
          label: 'Hoàn thành',
          color: 'green',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          icon: CheckCircleIcon,
          iconColor: 'text-green-600'
        };
      default:
        return {
          label: status || 'Không xác định',
          color: 'gray',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          icon: ExclamationCircleIcon,
          iconColor: 'text-gray-600'
        };
    }
  };

  // Format date/time
  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Lịch sử thay pin
        </h1>
        <p className="text-gray-600">
          Xem lịch sử các lần thay pin đã thực hiện
        </p>
      </div>

      {/* Sort & Filter Tabs */}
      <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap border-b border-gray-100">
          {/* Sort Options */}
          <div className="flex flex-1 min-w-0">
            {[
              { key: 'newest', label: 'Mới nhất', icon: '📅' },
              { key: 'oldest', label: 'Cũ nhất', icon: '📋' },
              { key: 'recent_swap', label: 'Thay gần đây', icon: '🔋' }
            ].map(option => (
              <button
                key={option.key}
                onClick={() => setSortBy(option.key)}
                className={`px-4 py-3 border-r border-gray-100 last:border-r-0 transition-colors flex-1 min-w-0 ${
                  sortBy === option.key
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'hover:bg-gray-50 text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>{option.icon}</span>
                  <span className="truncate">{option.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap">
          {[
            { key: 'all', label: 'Tất cả', count: swaps.length },
            { key: 'pending', label: 'Đang xử lý', count: swaps.filter(s => s.status?.toLowerCase() === 'pending').length },
            { key: 'completed', label: 'Hoàn thành', count: swaps.filter(s => s.status?.toLowerCase() === 'completed').length }
          ].map(option => (
            <button
              key={option.key}
              onClick={() => setStatusFilter(option.key)}
              className={`px-4 py-3 transition-colors flex-1 min-w-0 ${
                statusFilter === option.key
                  ? 'bg-blue-600 text-white font-medium'
                  : 'hover:bg-gray-50 text-gray-600 hover:text-gray-800'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span className="truncate">{option.label}</span>
                <span className="text-xs opacity-75">({option.count})</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary & Refresh */}
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {sortedSwaps.length > 0 ? (
            <div className="flex items-center gap-4">
              <span>
                {statusFilter !== 'all' && 'Đã lọc: '}
                <strong>{sortedSwaps.length}</strong>
                {statusFilter === 'all' ? ' lần thay pin' : ` / ${swaps.length} lần thay pin`}
              </span>
              <span>
                Có thanh toán: <strong className="text-green-600">
                  {sortedSwaps.filter(s => s.hasPayment).length}
                </strong>
              </span>
            </div>
          ) : (
            statusFilter === 'all' ? 'Chưa có lịch sử thay pin' : 'Không có lần thay pin nào với trạng thái này'
          )}
        </div>

        <div className="flex items-center gap-2">
          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Xóa bộ lọc
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Đang tải...</span>
              </div>
            ) : (
              'Làm mới'
            )}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Đang tải lịch sử thay pin...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BoltIcon className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Không thể tải dữ liệu
          </h3>
          <p className="text-sm text-red-600 mb-4">
            {error?.data?.message || error?.message || 'Có lỗi xảy ra khi tải lịch sử thay pin'}
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && sortedSwaps.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BoltIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {statusFilter === 'all' ? 'Chưa có lịch sử thay pin' : 'Không có lần thay pin nào'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {statusFilter === 'all'
              ? 'Bạn chưa thực hiện lần thay pin nào. Hãy đặt lịch để bắt đầu!'
              : 'Thử thay đổi bộ lọc trạng thái để xem kết quả khác.'}
          </p>
          <div className="flex justify-center gap-3">
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Xem tất cả
              </button>
            )}
            <button
              onClick={() => window.location.href = '/driver/booking'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Đặt lịch thay pin
            </button>
          </div>
        </div>
      )}

      {/* Swaps List */}
      {!isLoading && !error && sortedSwaps.length > 0 && (
        <div className="space-y-4">
          {sortedSwaps.map((swap) => {
            const statusConfig = getStatusConfig(swap.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div
                key={swap.swapId}
                className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${statusConfig.borderColor}`}
              >
                {/* Swap Header */}
                <div className={`flex items-center justify-between p-4 border-b border-gray-100 ${statusConfig.bgColor}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                      swap.status?.toLowerCase() === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}>
                      {swap.status?.toLowerCase() === 'completed' ? '⚡' : '🔄'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Mã thay pin: {swap.swapId}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Tạo: {formatDateTime(swap.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {swap.hasPayment && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        <CreditCardIcon className="w-3 h-3" />
                        <span>Đã thanh toán</span>
                      </div>
                    )}
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                      statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
                      <StatusIcon className={`w-4 h-4 ${statusConfig.iconColor}`} />
                      <span className="text-sm font-medium">
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Swap Details */}
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Vehicle Info */}
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <TruckIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">Phương tiện</h4>
                        <p className="text-sm text-gray-700 font-medium">
                          {swap.vehicleBrand} {swap.vehicleModel}
                        </p>
                        <p className="text-sm text-gray-600 font-mono">
                          {swap.licensePlate}
                        </p>
                      </div>
                    </div>

                    {/* Station Info */}
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPinIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">Trạm thay pin</h4>
                        <p className="text-sm text-gray-700 font-medium">
                          {swap.stationName}
                        </p>
                      </div>
                    </div>

                    {/* Battery Swap Info */}
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BoltIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">Thông tin pin</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-mono">
                            #{swap.batterySerial}
                          </span>
                          <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-mono">
                            #{swap.toBatterySerial}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Pin cũ → Pin mới
                        </p>
                      </div>
                    </div>

                    {/* Timing Info */}
                    <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ClockIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">Thời gian</h4>
                        {swap.swappedAt ? (
                          <p className="text-sm text-gray-700">
                            Hoàn thành: {formatDateTime(swap.swappedAt)}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-600 italic">
                            Chưa hoàn thành
                          </p>
                        )}
                        {swap.hasPayment && swap.paymentId && (
                          <p className="text-xs text-green-600 mt-1">
                            💳 Mã thanh toán: {swap.paymentId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {swapsResponse?.pagination && swapsResponse.pagination.totalCount > swapsResponse.pagination.pageSize && (
        <div className="mt-8 flex justify-center">
          <div className="text-sm text-gray-600">
            Hiển thị {sortedSwaps.length} / {swapsResponse.pagination.totalCount} lần thay pin
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapsPage;