import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  useGetAllBookingsQuery,
  useGetPendingBookingsByStationQuery,
  useConfirmBookingMutation,
  useRejectBookingMutation,
} from '@/services/booking.service';
import { useGetBatteriesByIdQuery } from '@/services/battery.service';
import { useInitPaymentMutation } from '@/services/payment.service';
import { useGetStationStaffByUserIdQuery } from '@/services/stationStaff.service';
import ConfirmModal from '@/components/common/ConfirmModal.jsx';
import DateFilter from '@/pages/driver/bookings/components/DateFilter';
import { filterBookingsByDate } from '@/utils/booking';

const formatPrice = (price) => {
  if (price === null || price === undefined) return 'N/A';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

function BatteryDetails({ batteryId }) {
  const { data } = useGetBatteriesByIdQuery({ id: batteryId }, { skip: !batteryId });
  const b = data?.content ? (Array.isArray(data.content) ? data.content[0] : data.content) : data || null;
  if (!b) return null;
  return (
    <div className="mt-2 text-sm text-gray-600">
      <div>Serial: {b.serialNo || b.id || b.batteryId || '—'}</div>
      <div>Loại: {b.batteryTypeName || b.type || '—'}</div>
      <div>Điện áp: {b.voltage || '—'}V - {b.capacityWh || '—'} Wh</div>
    </div>
  );
}

const statusColor = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  Completed: 'bg-blue-100 text-blue-700',
};

export default function SwapConfirm({ stationId: stationIdProp = null }) {
  // --- get userId from redux and resolve stationId via StationStaff API ---
  const userId = useSelector((state) => state.auth.user?.userId || state.auth.user?.id || null);
  const { data: stationStaffRes } = useGetStationStaffByUserIdQuery(userId, { skip: !userId });

  const stationIdFromUser = stationStaffRes?.content?.stationId || (Array.isArray(stationStaffRes?.content) ? stationStaffRes.content[0]?.stationId : null) || null;
  const stationId = stationIdProp || stationIdFromUser;

  const { data: pendingByStationData, isLoading: loadingStationPending, refetch: refetchStationPending } = useGetPendingBookingsByStationQuery(stationId ? { stationId, page: 1, size: 50, search: '', status: 'Pending' } : null, { skip: !stationId });
  const { data: allBookingsData, isLoading: loadingAll, refetch: refetchAll } = useGetAllBookingsQuery({ page: 1, size: 100, search: '' }, { skip: !!stationId });

  const [confirmBooking] = useConfirmBookingMutation();
  const [rejectBooking] = useRejectBookingMutation();
  const [initPayment] = useInitPaymentMutation();

  // confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null); // { bookingId, toBatteryId, method }
  const [confirmLoading, setConfirmLoading] = useState(false);

  // normalize list to render
  const bookings = useMemo(() => {
    if (stationId) return pendingByStationData?.content || [];
    const list = allBookingsData?.content || [];
    return list.filter((b) => (b.status || '').toLowerCase() === 'pending');
  }, [stationId, pendingByStationData, allBookingsData]);

  // derive a stationName from API result (call after useMemo)
  const stationNameFromBookings = bookings.find(b => b.stationName)?.stationName || pendingByStationData?.content?.[0]?.stationName || '[lỗi lấy tên]';

  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  // default to swappedAt, user can toggle order only
  const [sortField, setSortField] = useState('swappedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // for date filtering prefer swappedAt, fallback to createdAt
  const bookingsForDate = bookings.map((b) => ({ ...b, timeSlot: b.swappedAt || b.createdAt || null }));

  const filteredBookings = useMemo(() => {
    const withoutCompleted = bookings.filter((s) => String(s.status || '').toLowerCase() !== 'completed');
    const dateFiltered = filterBookingsByDate(bookingsForDate.filter((b) => withoutCompleted.some((w) => (w.bookingId || w.id) === (b.bookingId || b.id))), dateFilter, customDateFrom, customDateTo);
    const byStatus = filterStatus && filterStatus !== 'All' ? dateFiltered.filter((s) => String(s.status || '').toLowerCase() === String(filterStatus).toLowerCase()) : dateFiltered;
    const q = (search || '').trim().toLowerCase();
    let searched = byStatus;
    if (q) searched = byStatus.filter((s) => String(s.bookingId || '').toLowerCase().includes(q) || String(s.userName || s.user?.name || '').toLowerCase().includes(q) || String(s.licensePlate || s.vehicle?.license_plate || '').toLowerCase().includes(q));
    const sorted = searched.slice().sort((a, b) => {
      const aRaw = a[sortField];
      const bRaw = b[sortField];
      // treat swappedAt and createdAt as date fields
      if (sortField === 'createdAt' || sortField === 'swappedAt') {
        const aTime = new Date(aRaw || a.createdAt || 0).getTime() || 0;
        const bTime = new Date(bRaw || b.createdAt || 0).getTime() || 0;
        return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
      }
      const A = String(aRaw || '').toLowerCase();
      const B = String(bRaw || '').toLowerCase();
      if (A < B) return sortOrder === 'asc' ? -1 : 1;
      if (A > B) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [bookings, bookingsForDate, filterStatus, search, dateFilter, customDateFrom, customDateTo, sortField, sortOrder]);

  const loading = stationId ? loadingStationPending : loadingAll;
  const refetch = stationId ? refetchStationPending : refetchAll;

  // open confirm modal: require toBatteryId present (from batteryReturn.id)
  // now accepts method: 'Card' | 'Subscription_Plan' etc.
  const onConfirmClick = (bookingId, toBatteryId, method = 'Card') => {
    if (!toBatteryId) { toast.error('Không tìm thấy mã pin thay thế (toBatteryId). Không thể tạo swap.'); return; }
    setConfirmTarget({ bookingId, toBatteryId, method });
    setConfirmOpen(true);
  };

  // execute confirm + initPayment
  const onConfirmExecute = async () => {
    if (!confirmTarget) return;
    const { bookingId, method } = confirmTarget;
    setConfirmLoading(true);

    try {
      // 1) confirm booking
      await toast.promise(
        confirmBooking(bookingId).unwrap(),
        {
          loading: 'Đang xác nhận...',
          success: 'Xác nhận thành công',
          error: (err) => err?.data?.message || 'Xác nhận thất bại',
        }
      );

      // 2) init payment with method
      const paymentResp = await toast.promise(
        initPayment({ bookingId, paymentMethod: method }).unwrap(),
        {
          loading: method === 'Subscription_Plan' ? 'Áp dụng gói đăng ký...' : 'Đang khởi tạo thanh toán...',
          success: method === 'Subscription_Plan' ? 'Áp dụng gói đăng ký thành công' : 'Khởi tạo thanh toán thành công',
          error: (err) => err?.data?.message || 'Khởi tạo thanh toán thất bại',
        }
      );

      // For standard payment (QR/Card) we want to open returned paymentUrl if present.
      if (method !== 'Subscription_Plan') {
        const paymentUrl =
          paymentResp?.content?.paymentUrl ||
          paymentResp?.content?.payment_url ||
          paymentResp?.paymentUrl ||
          paymentResp?.payment_url ||
          null;

        if (paymentUrl) {
          try {
            window.open(paymentUrl, '_blank', 'noopener,noreferrer');
          } catch (openErr) {
            const a = document.createElement('a');
            a.href = paymentUrl;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a);
            a.click();
            a.remove();
          }
        } else {
          toast.error('Không tìm thấy paymentUrl từ response.');
        }
      } else {
        // Subscription path: do NOT open paymentUrl. Server applied subscription and save in record.
        toast.success('Thanh toán bằng gói đăng ký đã được xử lý.');
      }

      // success actions
      setConfirmOpen(false);
      setConfirmTarget(null);
      refetch && refetch();
    } catch (err) {
      // errors handled by toast.promise
    } finally {
      setConfirmLoading(false);
    }
  };

  const onReject = async (bookingId) => {
    const reason = window.prompt('Lý do từ chối (bắt buộc):');
    if (reason === null) return; // user cancelled prompt
    if (!reason.trim()) return alert('Vui lòng nhập lý do từ chối.');

    try {
      await toast.promise(
        rejectBooking({ bookingId, reason }).unwrap(),
        {
          loading: 'Đang từ chối...',
          success: 'Từ chối thành công',
          error: (err) => err?.data?.message || err?.message || 'Từ chối thất bại',
        }
      );
      refetch && refetch();
    } catch (err) {
      // handled
    }
  };

  return (
    <>
      <div className="p-6 mb-10 min-h-screen">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">Danh sách chờ duyệt đổi pin (Trạm: {stationNameFromBookings})</h1>
        {!stationId && userId && (<div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-300 text-sm text-yellow-800 rounded">Chú ý: hệ thống không xác định được trạm gán cho bạn — đang hiển thị tất cả booking (lọc Pending).</div>)}

        {/* Search-Filter-Sort sction */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm bookingId, tên tài xế, biển số..."
            className="border rounded px-3 py-2 text-sm w-64" />

          <select
            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-3 py-2 text-sm">
            <option value="All">Lọc tất cả trạng thái</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button
            onClick={() => setSortOrder((p) => p === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border rounded text-sm">{sortOrder === 'asc' ? '↑ Tăng dần ngày tạo' : '↓ Giảm dần ngày tạo'}
          </button>

          <button
            onClick={() => { refetchStationPending && refetchStationPending(); refetchAll && refetchAll(); }}
            className="px-3 py-2 bg-blue-600 text-white rounded text-sm">
            Làm mới
          </button>
        </div>

        <div className="mb-4">
          <DateFilter
            bookings={bookingsForDate}
            dateFilter={dateFilter}
            onChangeFilter={(v) => setDateFilter(v)}
            customDateFrom={customDateFrom}
            customDateTo={customDateTo}
            setCustomDateFrom={setCustomDateFrom}
            setCustomDateTo={setCustomDateTo}
          />
        </div>

        {/* Booking list here */}
        {loading ? (<div className="p-6 text-center">Đang tải...</div>) : filteredBookings.length === 0 ? (<div className="p-6 text-center text-gray-400 bg-white rounded-xl shadow col-span-2">Không có booking chờ duyệt</div>) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBookings.map((bk) => {
                const createdAt = bk.createdAt ? new Date(bk.createdAt).toLocaleString() : (bk.created_at || '');
                const bookingId = bk.bookingId || bk.booking_id || `${bk.id || Math.random()}`;
                const userName = bk.userName || bk.user?.full_name || bk.user?.name || '—';
                const userPhone = bk.userPhone || bk.user?.phone || '—';
                const vehicle = `${bk.vehicleBrand || bk.vehicle?.model || ''}`.trim();
                const license = bk.licensePlate || bk.vehicle?.license_plate || '—';
                const estimatedPrice = bk.estimatedPrice || bk.estimated_price || '—';
                const batteryReturn = { id: bk.batteryId || bk.battery_return?.battery_id || bk.battery_return?.id || '—', type: bk.batteryTypeName || bk.battery_return?.type || '—', status: bk.status || bk.battery_return?.status || 'Pending', voltage: bk.battery_return?.voltage || '—', capacity: bk.battery_return?.capacity_wh || bk.capacityWh || '—' };

                return (
                  <div key={bookingId} className="bg-white rounded-xl shadow p-6 flex flex-col gap-3 border border-gray-100">
                    <div className="flex items-center justify-between mb-2"><div className="font-bold text-blue-700 text-lg">#{bookingId}</div><div className="text-xs text-gray-400">{createdAt}</div></div>

                    <div className="flex flex-col gap-1 text-sm"><div><span className="font-semibold">Tài xế:</span> {userName} - <span className="font-semibold">SĐT:</span> {userPhone}</div><div><span className="font-semibold">Xe:</span> {vehicle} - {license}</div></div>

                    <div className="grid grid-cols-1 gap-4 mt-2">
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="font-semibold text-gray-700 mb-1">Pin khách đặt</div>
                        <div className="text-xs text-gray-500 mb-1">Mã pin: <span className="font-semibold text-gray-800">{batteryReturn.id}</span></div>
                        <div className="text-xs text-gray-500 mb-1">Trạng thái:&nbsp;<span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor[(batteryReturn.status || '').replace(/\s+/g, '')] || 'bg-gray-100 text-gray-700'}`}>{batteryReturn.status}</span></div>
                        {batteryReturn.id && <BatteryDetails batteryId={batteryReturn.id} />}
                      </div>

                      <div className="flex items-center gap-2 justify-end"><span className="text-gray-700 font-semibold">Tổng tiền thanh toán:</span><span className="text-green-700 font-bold text-lg">{formatPrice(estimatedPrice)}</span></div>
                    </div>

                    <div className="flex gap-3 mt-4 justify-end items-center">
                      {/* Dropdown using details/summary for simplicity */}
                      <details className="relative">
                        <summary className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer list-none text-sm">
                          Thanh toán ▾
                        </summary>

                        <div className="absolute right-0 mt-1 w-44 bg-white border rounded shadow z-20 overflow-hidden">
                          <button
                            onClick={() => onConfirmClick(bookingId, batteryReturn.id, 'Card')}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-200"
                          >
                            Thanh toán QR
                          </button>
                          <button
                            onClick={() => onConfirmClick(bookingId, batteryReturn.id, 'Subscription_Plan')}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-200"
                          >
                            Sử dụng gói đăng ký
                          </button>
                        </div>
                      </details>

                      <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-semibold" onClick={() => onReject(bookingId)}>Từ chối</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={confirmTarget?.method === 'Subscription_Plan' ? 'Xác nhận sử dụng gói đăng ký' : 'Xác nhận đổi pin'}
        onConfirm={onConfirmExecute}
        onCancel={() => { setConfirmOpen(false); setConfirmTarget(null); }}
        isLoading={confirmLoading}
        confirmText="Xác nhận"
        cancelText="Hủy"
      >
        <div className="text-sm text-gray-700">
          {confirmTarget?.method === 'Subscription_Plan' ? (
            <>
              Bạn chắc chắn muốn xác nhận booking <strong>{confirmTarget?.bookingId}</strong> và **áp dụng gói đăng ký** cho mã pin <strong>{confirmTarget?.toBatteryId}</strong>?
              <div className="text-xs text-gray-500 mt-2">Lưu ý: thao tác này sẽ tạo bản ghi thanh toán với phương thức <em>Subscription_Plan</em> và không mở link thanh toán.</div>
            </>
          ) : (
            <>
              Bạn chắc chắn muốn xác nhận và tạo thanh toán cho booking <strong>{confirmTarget?.bookingId}</strong> với mã pin <strong>{confirmTarget?.toBatteryId}</strong> ?
            </>
          )}
        </div>
      </ConfirmModal>
    </>
  );
}
