import React, { useEffect, useMemo, useState } from 'react';
import { useGetMyBookingsQuery } from '../../../services/booking.service';
import toast from '../../../utils/toast';
import SortTabs from './components/SortTabs';
import DateFilter from './components/DateFilter';
import BookingCard from './components/BookingCard';
import CountdownTimer from './components/CountdownTimer'; // nếu nơi khác cần
import { CalendarIcon } from '@heroicons/react/24/outline';
import { filterBookingsByDate } from '../../../utils/booking';

const BookingsPage = () => {
  const [sortBy, setSortBy] = useState('newest');
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');

  const { data: bookingsResponse, isLoading, error, refetch } = useGetMyBookingsQuery();

  const handleRefresh = () => {
    toast.info('🔄 Đang làm mới dữ liệu...');
    refetch();
  };

  useEffect(() => {
    if (error) toast.error('Không thể tải danh sách đặt chỗ');
  }, [error]);

  // Use real API data
  const bookings = bookingsResponse?.content || [];

  // Reset custom khi rời 'custom'
  useEffect(() => {
    if (dateFilter !== 'custom') {
      setCustomDateFrom('');
      setCustomDateTo('');
    }
  }, [dateFilter]);

  // Lọc + Sort
  const filtered = useMemo(
    () => filterBookingsByDate(bookings, dateFilter, customDateFrom, customDateTo),
    [bookings, dateFilter, customDateFrom, customDateTo]
  );

  const sortedBookings = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case 'newest':   return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':   return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'upcoming': return arr.sort((a, b) => new Date(a.timeSlot) - new Date(b.timeSlot));
      case 'recent':   return arr.sort((a, b) => new Date(b.timeSlot) - new Date(a.timeSlot));
      default:         return arr;
    }
  }, [filtered, sortBy]);

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch đặt chỗ thay pin</h1>
        <p className="text-gray-600">Xem lịch đặt chỗ thay pin của bạn với bộ đếm thời gian thực</p>
      </div>

      <SortTabs sortBy={sortBy} onChange={setSortBy} />

      <DateFilter
        bookings={bookings}
        dateFilter={dateFilter}
        onChangeFilter={setDateFilter}
        customDateFrom={customDateFrom}
        customDateTo={customDateTo}
        setCustomDateFrom={setCustomDateFrom}
        setCustomDateTo={setCustomDateTo}
      />

      {/* Summary + Refresh */}
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {sortedBookings.length > 0 ? (
            <div className="flex items-center gap-4">
              <span>
                {dateFilter !== 'all' && 'Đã lọc: '}
                <strong>{sortedBookings.length}</strong>
                {dateFilter === 'all' ? ' lịch đặt' : ` / ${bookings.length} lịch đặt`}
              </span>
              <span>
                Chờ xử lý: <strong className="text-yellow-600">
                  {sortedBookings.filter((b) => b.status?.toLowerCase() === 'pending').length}
                </strong>
              </span>
              <span>
                Đã xác nhận: <strong className="text-blue-600">
                  {sortedBookings.filter((b) => b.status?.toLowerCase() === 'confirmed').length}
                </strong>
              </span>
              <span>
                Hoàn thành: <strong className="text-green-600">
                  {sortedBookings.filter((b) => b.status?.toLowerCase() === 'completed').length}
                </strong>
              </span>
            </div>
          ) : (
            dateFilter === 'all' ? 'Không có lịch đặt nào' : 'Không có lịch đặt nào trong khoảng thời gian này'
          )}
        </div>

        <div className="flex items-center gap-2">
          {dateFilter !== 'all' && (
            <button
              onClick={() => {
                setDateFilter('all');
                setCustomDateFrom('');
                setCustomDateTo('');
              }}
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

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Đang tải lịch đặt chỗ...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Không thể tải dữ liệu
          </h3>
          <p className="text-sm text-red-600 mb-4">
            {error?.data?.message || error?.message || 'Có lỗi xảy ra khi tải danh sách đặt chỗ'}
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
            {dateFilter === 'all' ? 'Chưa có lịch đặt nào' : 'Không có lịch đặt trong khoảng thời gian này'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {dateFilter === 'all'
              ? 'Bạn chưa đặt lịch thay pin nào. Hãy tạo lịch đặt đầu tiên!'
              : 'Thử thay đổi bộ lọc thời gian hoặc tạo lịch đặt mới.'}
          </p>
          <div className="flex justify-center gap-3">
            {dateFilter !== 'all' && (
              <button
                onClick={() => setDateFilter('all')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Xem tất cả
              </button>
            )}
            <button
              onClick={() => (window.location.href = '/driver/booking')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Đặt lịch ngay
            </button>
          </div>
        </div>
      )}

      {/* Booking List */}
      {!isLoading && !error && sortedBookings.length > 0 && (
        <div className="space-y-4">
          {sortedBookings.map((b) => (
            <BookingCard key={b.bookingId} booking={b} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {bookingsResponse?.pagination &&
        bookingsResponse.pagination.totalCount > bookingsResponse.pagination.pageSize && (
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
