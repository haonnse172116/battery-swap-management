import {
  CalendarDaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  TrendingUpIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import {
  useGetAllBookingsQuery,
  useGetMyBookingsQuery
} from '../../../services/booking.service';

const BookingDashboard = () => {
  const user = useSelector(state => state.auth.user);
  const userRole = user?.role?.toLowerCase();
  const { 
    data: bookingsData, 
    isLoading, 
    isError 
  } = userRole === 'driver' 
    ? useGetMyBookingsQuery({ pageSize: 100 })
    : useGetAllBookingsQuery({ pageSize: 100 });

  const bookings = userRole === 'driver' 
    ? (bookingsData || [])
    : (bookingsData?.bookings || []);
    
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };
  const recentBookings = bookings
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const statusConfig = {
    pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
    confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon },
    completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
    cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: XCircleIcon },
  };

  if (isLoading) {
    return (
      <div className="px-10 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-10 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">Không thể tải thống kê đặt lịch</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-10 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {userRole === 'driver' ? 'Thống kê đặt lịch của bạn' : 'Thống kê đặt lịch hệ thống'}
        </h1>
        <p className="text-gray-600">Tổng quan về tình trạng đặt lịch swap pin</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Tổng đặt lịch</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <CalendarDaysIcon className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Chờ xác nhận</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <ClockIcon className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Đã xác nhận</p>
              <p className="text-2xl font-bold">{stats.confirmed}</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Hoàn thành</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <TrendingUpIcon className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Đã hủy</p>
              <p className="text-2xl font-bold">{stats.cancelled}</p>
            </div>
            <XCircleIcon className="w-8 h-8 text-red-200" />
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Đặt lịch gần đây</h2>
          </div>
          {userRole === 'driver' ? (
            <button 
              onClick={() => window.location.href = '/driver/booking-history'}
              className="text-blue-600 hover:underline text-sm"
            >
              Xem tất cả
            </button>
          ) : (
            <button 
              onClick={() => window.location.href = '/staff/booking-management'}
              className="text-blue-600 hover:underline text-sm"
            >
              Quản lý đặt lịch
            </button>
          )}
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CalendarDaysIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Chưa có đặt lịch nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentBookings.map((booking) => {
              const statusInfo = statusConfig[booking.status] || statusConfig.pending;
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={booking.bookingId}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        #{booking.bookingId}
                        {userRole !== 'driver' && (
                          <span className="text-gray-500 font-normal"> - {booking.userName}</span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{booking.stationName}</span>
                        <span>•</span>
                        <span>{booking.vehicleName} ({booking.licensePlate})</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.bookingTime).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${statusInfo.color}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{statusInfo.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDashboard;