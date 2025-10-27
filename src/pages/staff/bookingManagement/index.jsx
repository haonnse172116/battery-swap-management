import {
    CalendarDaysIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon,
    MapPinIcon,
    TruckIcon,
    UserIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import {
    useConfirmBookingMutation,
    useGetAllBookingsQuery,
    useRejectBookingMutation
} from '../../../services/booking.service';

const StaffBookingManagement = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('pending');
  const [search, setSearch] = useState('');
  
  const { 
    data: bookingsData, 
    isLoading, 
    isError, 
    error 
  } = useGetAllBookingsQuery({
    page,
    pageSize: 20,
    status,
    search,
  });

  const [confirmBooking] = useConfirmBookingMutation();
  const [rejectBooking] = useRejectBookingMutation();

  const bookings = bookingsData?.bookings || [];
  const pagination = bookingsData?.pagination || {};

  const statusConfig = {
    pending: { 
      label: 'Chờ xác nhận', 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: ClockIcon 
    },
    confirmed: { 
      label: 'Đã xác nhận', 
      color: 'bg-blue-100 text-blue-800', 
      icon: CheckCircleIcon 
    },
    completed: { 
      label: 'Hoàn thành', 
      color: 'bg-green-100 text-green-800', 
      icon: CheckCircleIcon 
    },
    cancelled: { 
      label: 'Đã hủy', 
      color: 'bg-red-100 text-red-800', 
      icon: XCircleIcon 
    },
    rejected: { 
      label: 'Bị từ chối', 
      color: 'bg-red-100 text-red-800', 
      icon: ExclamationTriangleIcon 
    },
  };

  const handleConfirmBooking = async (bookingId) => {
    if (!confirm('Xác nhận đặt lịch này?')) return;

    try {
      await confirmBooking(bookingId).unwrap();
      alert('Đã xác nhận đặt lịch thành công!');
    } catch (error) {
      alert(`Không thể xác nhận: ${error.data?.message || 'Lỗi không xác định'}`);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason) return;

    try {
      await rejectBooking({ bookingId, reason }).unwrap();
      alert('Đã từ chối đặt lịch!');
    } catch (error) {
      alert(`Không thể từ chối: ${error.data?.message || 'Lỗi không xác định'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="px-10 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách đặt lịch...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-10 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 mb-4">
            ❌ Không thể tải danh sách đặt lịch: {error?.data?.message || 'Lỗi không xác định'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:underline"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-10 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý đặt lịch</h1>
        <p className="text-gray-600">Xác nhận và quản lý các đặt lịch swap pin</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
              <option value="rejected">Bị từ chối</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tên khách hàng, biển số xe..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <CalendarDaysIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Không có đặt lịch nào
          </h3>
          <p className="text-gray-500">
            Không có đặt lịch phù hợp với bộ lọc hiện tại.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const statusInfo = statusConfig[booking.status] || statusConfig.pending;
            const StatusIcon = statusInfo.icon;
            const isPending = booking.status === 'pending';

            return (
              <div
                key={booking.bookingId}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        #{booking.bookingId}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.createdAt).toLocaleDateString('vi-VN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${statusInfo.color}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{statusInfo.label}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Customer Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <UserIcon className="w-4 h-4 text-gray-500" />
                      <h4 className="font-medium text-gray-800">Khách hàng</h4>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{booking.userName}</p>
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TruckIcon className="w-4 h-4 text-gray-500" />
                      <h4 className="font-medium text-gray-800">Phương tiện</h4>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{booking.vehicleName}</p>
                      <p className="font-mono">{booking.licensePlate}</p>
                    </div>
                  </div>

                  {/* Station Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPinIcon className="w-4 h-4 text-gray-500" />
                      <h4 className="font-medium text-gray-800">Trạm</h4>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{booking.stationName}</p>
                      <p className="text-xs">{booking.stationAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>
                        Thời gian: {new Date(booking.bookingTime).toLocaleString('vi-VN', {
                          weekday: 'short',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {booking.price && (
                      <div className="font-semibold text-blue-600">
                        💰 {booking.price.toLocaleString('vi-VN')} VNĐ
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleRejectBooking(booking.bookingId)}
                          className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition text-sm"
                        >
                          Từ chối
                        </button>
                        <button
                          onClick={() => handleConfirmBooking(booking.bookingId)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                        >
                          Xác nhận
                        </button>
                      </>
                    )}
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm">
                      Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Trang {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= pagination.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffBookingManagement;