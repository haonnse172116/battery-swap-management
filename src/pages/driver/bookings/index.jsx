import React, { useState, useEffect } from 'react';
import { useGetMyBookingsQuery } from '../../../services/booking.service';
import { 
  ClockIcon, 
  MapPinIcon, 
  TruckIcon,
  BoltIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import toast from '../../../utils/toast'; // ✅ Simple import

const BookingsPage = () => {
  const [sortBy, setSortBy] = useState('newest');
  
  const { 
    data: bookingsResponse, 
    isLoading, 
    error,
    refetch 
  } = useGetMyBookingsQuery();

  // ✅ Refresh with toast
  const handleRefresh = () => {
    toast.info(' Đang làm mới dữ liệu...');
    refetch();
  };

  // ✅ Error handling with toast
  useEffect(() => {
    if (error) {
      toast.error('Không thể tải danh sách đặt chỗ');
    }
  }, [error]);

  // ✅ Simplified mock data - just scheduled appointments
  const mockBookings = process.env.NODE_ENV === 'development' ? [
    {
      bookingId: "BK2025102701",
      stationName: "Trạm thay pin Thủ Đức",
      stationAddress: "123 Võ Văn Ngân, Thủ Đức, TP.HCM",
      vehicleBrand: "VinFast",
      vehicleModel: "VF8",
      licensePlate: "51A-12345",
      batteryTypeName: "VinFast VF8 Battery",
      timeSlot: "2025-10-28T14:30:00.000Z",
      createdAt: "2025-10-27T10:15:00.000Z"
    },
    {
      bookingId: "BK2025102602",
      stationName: "Trạm thay pin Quận 1",
      stationAddress: "456 Lê Lợi, Quận 1, TP.HCM",
      vehicleBrand: "VinFast",
      vehicleModel: "VF9",
      licensePlate: "51B-67890",
      batteryTypeName: "VinFast VF9 Battery",
      timeSlot: "2025-10-26T09:00:00.000Z",
      createdAt: "2025-10-25T15:30:00.000Z"
    },
    {
      bookingId: "BK2025102503",
      stationName: "Trạm thay pin Bình Thạnh",
      stationAddress: "789 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM",
      vehicleBrand: "VinFast",
      vehicleModel: "VF8",
      licensePlate: "51A-12345",
      batteryTypeName: "VinFast VF8 Battery",
      timeSlot: "2025-10-25T16:15:00.000Z",
      createdAt: "2025-10-25T08:20:00.000Z"
    },
    {
      bookingId: "BK2025102404",
      stationName: "Trạm thay pin Quận 7",
      stationAddress: "321 Nguyễn Thị Thập, Quận 7, TP.HCM",
      vehicleBrand: "VinFast",
      vehicleModel: "VF8",
      licensePlate: "51A-12345",
      batteryTypeName: "VinFast VF8 Battery",
      timeSlot: "2025-11-01T10:00:00.000Z",
      createdAt: "2025-10-24T14:45:00.000Z"
    }
  ] : [];

  const bookings = bookingsResponse?.content?.length > 0 ? bookingsResponse.content : mockBookings;

  // ✅ Sort bookings instead of filtering by status
  const sortedBookings = [...bookings].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'upcoming':
        return new Date(a.timeSlot) - new Date(b.timeSlot);
      case 'recent':
        return new Date(b.timeSlot) - new Date(a.timeSlot);
      default:
        return 0;
    }
  });

  // ✅ Format date/time
  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return { date: 'N/A', time: 'N/A' };
      
      return {
        date: date.toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: date.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    } catch (error) {
      return { date: 'N/A', time: 'N/A' };
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // ✅ Check if appointment is upcoming or past
  const isUpcoming = (timeSlot) => {
    return new Date(timeSlot) > new Date();
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* ✅ Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Lịch đặt chỗ thay pin
        </h1>
        <p className="text-gray-600">
          Xem lịch đặt chỗ thay pin của bạn
        </p>
      </div>

      <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap">
          {[
            { key: 'newest', label: 'Mới nhất', icon: '📅' },
            { key: 'oldest', label: 'Cũ nhất', icon: '📋' },
            { key: 'upcoming', label: 'Sắp tới', icon: '⏰' },
            { key: 'recent', label: 'Gần đây', icon: '🕒' }
          ].map(option => (
            <button
              key={option.key}
              onClick={() => setSortBy(option.key)}
              className={`px-4 py-3 border-b-2 transition-colors flex-1 min-w-0 ${
                sortBy === option.key
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                  : 'border-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-800'
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

      {/* ✅ Summary & Refresh */}
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {sortedBookings.length > 0 ? (
            <div className="flex items-center gap-4">
              <span>
                Tổng: <strong>{sortedBookings.length}</strong> lịch đặt
              </span>
              <span>
                Sắp tới: <strong className="text-blue-600">
                  {sortedBookings.filter(b => isUpcoming(b.timeSlot)).length}
                </strong>
              </span>
              <span>
                Đã qua: <strong className="text-gray-500">
                  {sortedBookings.filter(b => !isUpcoming(b.timeSlot)).length}
                </strong>
              </span>
            </div>
          ) : (
            'Không có lịch đặt nào'
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Làm mới
        </button>
      </div>

      {/* ✅ Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Đang tải lịch đặt chỗ...</p>
          </div>
        </div>
      )}

      {/* ✅ Error State */}
      {error && !bookings.length && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 mb-2">
            ❌ Không thể tải lịch đặt chỗ
          </p>
          <button
            onClick={() => refetch()}
            className="text-sm text-blue-600 hover:underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ✅ Empty State */}
      {!isLoading && !error && sortedBookings.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Chưa có lịch đặt nào
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Bạn chưa đặt lịch thay pin nào. Hãy tạo lịch đặt đầu tiên!
          </p>
          <button
            onClick={() => window.location.href = '/driver/booking'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Đặt lịch ngay
          </button>
        </div>
      )}

      {/* ✅ Bookings List */}
      {!isLoading && sortedBookings.length > 0 && (
        <div className="space-y-4">
          {sortedBookings.map((booking) => {
            const timeSlotFormatted = formatDateTime(booking.timeSlot);
            const upcoming = isUpcoming(booking.timeSlot);
            
            return (
              <div
                key={booking.bookingId}
                className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden ${
                  upcoming 
                    ? 'border-blue-200 ring-1 ring-blue-100' 
                    : 'border-gray-200'
                }`}
              >
                {/* ✅ Booking Header */}
                <div className={`flex items-center justify-between p-4 border-b border-gray-100 ${
                  upcoming ? 'bg-blue-50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                      upcoming ? 'bg-blue-500' : 'bg-gray-500'
                    }`}>
                      🎫
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Mã đặt chỗ: {booking.bookingId}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Đặt ngày: {formatDate(booking.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {/* ✅ Time Badge */}
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                    upcoming 
                      ? 'bg-blue-100 text-blue-700 border-blue-200' 
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    <ClockIcon className={`w-4 h-4 ${upcoming ? 'text-blue-600' : 'text-gray-600'}`} />
                    <span className="text-sm font-medium">
                      {upcoming ? 'Sắp tới' : 'Đã qua'}
                    </span>
                  </div>
                </div>

                {/* ✅ Booking Details Grid */}
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ✅ Vehicle Info */}
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <TruckIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">Xe</h4>
                        <p className="text-sm text-gray-700 font-medium">
                          {booking.vehicleBrand} {booking.vehicleModel}
                        </p>
                        <p className="text-sm text-gray-600 font-mono">
                          {booking.licensePlate}
                        </p>
                        <p className="text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded mt-1 inline-block">
                          🔋 {booking.batteryTypeName}
                        </p>
                      </div>
                    </div>

                    {/* ✅ Station Info */}
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPinIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">Trạm thay pin</h4>
                        <p className="text-sm text-gray-700 font-medium">
                          {booking.stationName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {booking.stationAddress}
                        </p>
                      </div>
                    </div>

                    {/* ✅ Time Slot Info */}
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ClockIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">Thời gian đặt</h4>
                        <p className="text-sm text-gray-700 font-medium">
                          {timeSlotFormatted.date}
                        </p>
                        <p className="text-sm text-gray-600">
                          Lúc {timeSlotFormatted.time}
                        </p>
                        {upcoming && (
                          <p className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded mt-1 inline-block">
                            ⏰ Nhớ đến đúng giờ nhé!
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ✅ Simple Info */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BoltIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">Dịch vụ</h4>
                        <p className="text-sm text-gray-700 font-medium">
                          Thay pin xe điện
                        </p>
                        <p className="text-xs text-gray-600">
                          📝 Đặt lúc: {formatDate(booking.createdAt)}
                        </p>           
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ Pagination (for future use) */}
      {bookingsResponse?.pagination && bookingsResponse.pagination.totalCount > bookingsResponse.pagination.pageSize && (
        <div className="mt-8 flex justify-center">
          <div className="text-sm text-gray-600">
            Hiển thị {sortedBookings.length} / {bookingsResponse.pagination.totalCount} lịch đặt
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;