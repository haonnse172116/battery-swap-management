import React, { useState, useEffect, useMemo } from 'react';
import { 
  BoltIcon, 
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from '../../../utils/toast';
import { useGetMyBookingsQuery } from '../../../services/booking.service';
import { useUser } from '../../../hooks/useUser';
import BookingCard from './components/BookingCard';
import SortTabs from './components/SortTabs';
import DateFilter from './components/DateFilter';
import { 
  filterBookingsByDate, 
  parseVietnameseDate,
  isUpcoming,
  getEffectiveStatus
} from '../../../utils/booking'; 

const BookingsPage = () => {
  const [sortBy, setSortBy] = useState('newest');
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');

  const { userInfo: currentUser, isLoading: isLoadingUser } = useUser();
  
  const { 
    data: bookingsResponse, 
    isLoading, 
    error,
    refetch 
  } = useGetMyBookingsQuery(undefined, {
    skip: !currentUser?.userId,
    refetchOnMountOrArgChange: true,
  });

  // ✅ Safe refetch function
  const handleRefresh = () => {
    toast.info('Đang làm mới dữ liệu...');
    try {
      if (refetch) {
        refetch();
      }
    } catch (error) {
      console.warn('Refetch error:', error);
      toast.error('Không thể làm mới dữ liệu');
    }
  };

  // ✅ Safe update handler for child components
  const handleUpdate = () => {
    try {
      if (refetch && currentUser?.userId) {
        refetch();
      }
    } catch (error) {
      console.warn('Update error:', error);
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(' Không thể tải danh sách đặt lịch');
    }
  }, [error]);

  const bookings = bookingsResponse?.content || [];

  // Filter bookings by date using utils
  const filteredBookings = useMemo(() => {
    return filterBookingsByDate(bookings, dateFilter, customDateFrom, customDateTo);
  }, [bookings, dateFilter, customDateFrom, customDateTo]);

  // Sort bookings using timeSlot with utils
  const sortedBookings = useMemo(() => {
    const arr = [...filteredBookings];
    
    switch (sortBy) {
      case 'newest': 
        return arr.sort((a, b) => {
          const dateA = parseVietnameseDate(a.timeSlot);
          const dateB = parseVietnameseDate(b.timeSlot);
          if (!dateA || !dateB) return 0;
          return dateB - dateA; // Newest appointment time first
        });
        
      case 'oldest':
        return arr.sort((a, b) => {
          const dateA = parseVietnameseDate(a.timeSlot);
          const dateB = parseVietnameseDate(b.timeSlot);
          if (!dateA || !dateB) return 0;
          return dateA - dateB; // Oldest appointment time first
        });
        
      case 'upcoming':
        return arr
          .filter(booking => isUpcoming(booking.timeSlot, booking.status))
          .sort((a, b) => {
            const dateA = parseVietnameseDate(a.timeSlot);
            const dateB = parseVietnameseDate(b.timeSlot);
            if (!dateA || !dateB) return 0;
            return dateA - dateB; // Soonest first
          });
          
      case 'recent':
        return arr.sort((a, b) => {
          const dateA = parseVietnameseDate(a.timeSlot);
          const dateB = parseVietnameseDate(b.timeSlot);
          if (!dateA || !dateB) return 0;
          return dateB - dateA; // Most recent first
        });
        
      default:
        return arr;
    }
  }, [filteredBookings, sortBy]);

  //  Statistics using utils
  const stats = useMemo(() => {
    const total = bookings.length;
    const upcoming = bookings.filter(b => isUpcoming(b.timeSlot, b.status)).length;
    const completed = bookings.filter(b => getEffectiveStatus(b.timeSlot, b.status) === 'completed').length;
    const cancelled = bookings.filter(b => getEffectiveStatus(b.timeSlot, b.status) === 'cancelled').length;
    const expired = bookings.filter(b => getEffectiveStatus(b.timeSlot, b.status) === 'expired').length;
    
    return { total, upcoming, completed, cancelled, expired };
  }, [bookings]);

  // Show login required message if no user
  if (!currentUser && !isLoadingUser) {
    return (
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Cần đăng nhập</h3>
          <p className="text-gray-600">Vui lòng đăng nhập để xem lịch đặt của bạn.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Lịch đặt của tôi
        </h1>
        <p className="text-gray-600">
          Quản lý và theo dõi các lịch đặt thay pin của bạn
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-700">Tổng số</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.upcoming}</div>
            <div className="text-sm text-green-700">Sắp tới</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
            <div className="text-sm text-emerald-700">Hoàn thành</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-sm text-red-700">Đã hủy</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.expired}</div>
            <div className="text-sm text-gray-700">Quá hạn</div>
          </div>
        </div>
      </div>

      {/* Sort Tabs */}
      <SortTabs 
        sortBy={sortBy} 
        setSortBy={setSortBy}
        stats={stats}
      />

      {/* Date Filter */}
      <DateFilter 
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        customDateFrom={customDateFrom}
        setCustomDateFrom={setCustomDateFrom}
        customDateTo={customDateTo}
        setCustomDateTo={setCustomDateTo}
      />

      {/* Summary & Refresh */}
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {sortedBookings.length > 0 ? (
            <div className="flex items-center gap-4">
              <span>
                {dateFilter !== 'all' && 'Đã lọc: '}
                <strong>{sortedBookings.length}</strong>
                {dateFilter === 'all' ? ' lịch đặt' : ` / ${bookings.length} lịch đặt`}
              </span>
              {dateFilter !== 'all' && (
                <span className="text-blue-600">
                  Bộ lọc: {dateFilter === 'today' ? 'Hôm nay' : 
                          dateFilter === 'tomorrow' ? 'Ngày mai' :
                          dateFilter === 'this_week' ? 'Tuần này' :
                          dateFilter === 'this_month' ? 'Tháng này' :
                          dateFilter === 'custom' ? 'Tùy chọn' : dateFilter}
                </span>
              )}
            </div>
          ) : (
            dateFilter === 'all' ? 'Chưa có lịch đặt nào' : 'Không có lịch đặt nào trong khoảng thời gian này'
          )}
        </div>

        <div className="flex items-center gap-2">
          {(dateFilter !== 'all' || sortBy !== 'newest') && (
            <button
              onClick={() => {
                setDateFilter('all');
                setSortBy('newest');
                setCustomDateFrom('');
                setCustomDateTo('');
              }}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Reset bộ lọc
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
            <p className="text-sm text-gray-600">Đang tải danh sách đặt lịch...</p>
            {currentUser && (
              <p className="text-xs text-gray-500 mt-1">
                Đang tải cho: {currentUser.fullName || currentUser.email}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Không thể tải dữ liệu
          </h3>
          <p className="text-sm text-red-600 mb-4">
            {error?.data?.message || error?.message || 'Có lỗi xảy ra khi tải danh sách đặt lịch'}
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
      {!isLoading && !error && sortedBookings.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {dateFilter === 'all' ? 'Chưa có lịch đặt' : 'Không có lịch đặt nào'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {dateFilter === 'all'
              ? 'Bạn chưa đặt lịch thay pin nào. Hãy đặt lịch ngay!'
              : 'Thử thay đổi bộ lọc thời gian để xem kết quả khác.'}
          </p>
          <div className="flex justify-center gap-3">
            {dateFilter !== 'all' && (
              <button
                onClick={() => {
                  setDateFilter('all');
                  setCustomDateFrom('');
                  setCustomDateTo('');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Xem tất cả
              </button>
            )}
            <button
              onClick={() => window.location.href = '/driver/booking/create'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Đặt lịch ngay
            </button>
          </div>
        </div>
      )}

      {/* Bookings List */}
      {!isLoading && !error && sortedBookings.length > 0 && (
        <div className="space-y-4">
          {sortedBookings.map((booking) => (
            <BookingCard 
              key={booking.bookingId || booking.id} 
              booking={booking}
              onUpdate={handleUpdate} // ✅ Use safe update handler
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default BookingsPage;
