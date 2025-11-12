import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useGetStationStaffByUserIdQuery } from '@/services/stationStaff.service';
import { useGetSwapsByStationQuery } from '@/services/batterySwap.service';
import { useCompletedSwapMutation, useRejectSwapMutation } from '@/services/staffManagementBattery.service';
import { useGetPaymentByIdQuery } from '@/services/payment.service';
import { useGetBatteriesByIdQuery } from '@/services/battery.service';
import DateFilter from '@/pages/driver/bookings/components/DateFilter';
import { filterBookingsByDate } from '@/utils/booking';

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
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  Completed: 'bg-blue-100 text-blue-700',
};

const formatPrice = (price) => {
  if (price === null || price === undefined) return 'N/A';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

function SwapCard({ s, onApprove, onReject }) {
  const paymentId = s.paymentId || null;
  const { data: paymentData } = useGetPaymentByIdQuery({ paymentId }, { skip: !paymentId });
  const amount = paymentData?.content?.amount ?? paymentData?.amount ?? '—';

  const swappedAt = s.swappedAt ? new Date(s.swappedAt).toLocaleString() : (s.swappedAt || '') || s.createdAt ? new Date(s.createdAt).toLocaleString() : (s.createdAt || '');
  const swapId = s.swapId || '—';
  const userName = s.userName || s.user?.name || '—';
  const userPhone = s.userPhone || s.user?.phone || '—';
  const vehicle = `${s.vehicleBrand || ''} ${s.vehicleModel || ''}`.trim();
  const license = s.licensePlate || '—';
  const batteryId = s.batteryId || '—';
  const hasPayment = !!s.hasPayment;

  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-3 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-blue-700 text-lg">#{swapId}</div>
        <div className="text-xs text-gray-400">{swappedAt}</div>
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <div><span className="font-semibold">Tài xế:</span> {userName} - <span className="font-semibold">SĐT:</span> {userPhone}</div>
        <div><span className="font-semibold">Xe:</span> {vehicle} - {license}</div>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-2">
        <div className="bg-gray-50 rounded-lg p-3 border">
          <div className="font-semibold text-gray-700 mb-1">Pin đã đổi</div>
          <div className="text-xs text-gray-500 mb-1">
            Mã pin: <span className="font-semibold text-gray-800">{batteryId}</span>
          </div>
          <div className="text-xs text-gray-500 mb-1">
            Trạng thái:{' '}
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor[s.status] || 'bg-gray-100 text-gray-700'}`}>
              {s.status}
            </span>
          </div>
          {batteryId && <BatteryDetails batteryId={batteryId} />}
        </div>

        <div className="flex items-center gap-2 justify-end">
          <span className="text-gray-700 font-semibold">Tổng tiền thanh toán:</span>
          <span className="text-green-700 font-bold text-lg">
            {formatPrice(amount)}
          </span>
        </div>
      </div>

      <div className="flex gap-3 mt-4 justify-end">
        {hasPayment ? (
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-semibold"
            onClick={() => onApprove(s.swapId)}
          >
            Xác nhận hoàn tất đổi pin
          </button>
        ) : (
          <button
            className="px-4 py-2 bg-orange-500 text-white rounded text-sm font-semibold cursor-not-allowed"
            disabled
          >
            Chưa hoàn tất thanh toán
          </button>
        )}

        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-semibold"
          onClick={() => onReject(s.swapId)}
        >
          Từ chối
        </button>
      </div>
    </div>
  );
}

export default function TransactionConfirm() {
  // current user -> get assigned station
  const userId = useSelector((state) => state.auth.user?.userId || state.auth.user?.id || null);
  const { data: stationStaffRes } = useGetStationStaffByUserIdQuery(userId, { skip: !userId });

  const stationId =
    stationStaffRes?.content?.stationId ||
    (Array.isArray(stationStaffRes?.content) ? stationStaffRes.content[0]?.stationId : null) ||
    null;

  // query swaps only for that station (skip when no stationId)
  const { data, isLoading, refetch } = useGetSwapsByStationQuery(
    { stationId, page: 1, pageSize: 10000 },
    { skip: !stationId }
  );

  const [completedSwap] = useCompletedSwapMutation();
  const [rejectSwap] = useRejectSwapMutation();

  // derive a stationName from API result
  const stationNameFromSwaps = data?.content?.[0]?.stationName || '[lỗi lấy tên]';

  // local filters
  const [filterStatus, setFilterStatus] = useState('All'); // All, Pending, Confirmed, Cancelled
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [sortField, setSortField] = useState('swappedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // base list from API (or empty)
  const rawSwaps = data?.content || [];

  // apply date filter via DateFilter util. Map swaps to objects with timeSlot
  const bookingsForDate = rawSwaps.map((s) => ({ ...s, timeSlot: s.swappedAt || s.createdAt || null }));

  // remove Completed items ALWAYS, then apply search + status filter
  const swaps = useMemo(() => {
    // exclude Completed
    const withoutCompleted = rawSwaps.filter((s) => String(s.status || '').toLowerCase() !== 'completed');

    // apply date filter via DateFilter util. Use bookingsForDate here (already has timeSlot)
    const dateFiltered = filterBookingsByDate(
      // we need only the objects that correspond to withoutCompleted -> keep order by mapping ids
      bookingsForDate.filter(b => withoutCompleted.some(w => (w.swapId || w.id) === (b.swapId || b.id)))
      , dateFilter, customDateFrom, customDateTo);
    // status filter
    const byStatus =
      filterStatus && filterStatus !== 'All'
        ? dateFiltered.filter((s) => String(s.status || '').toLowerCase() === String(filterStatus).toLowerCase())
        : dateFiltered;

    // search (swapId, userName, licensePlate)
    const q = (search || '').trim().toLowerCase();
    let searched = byStatus;
    if (q) {
      searched = byStatus.filter((s) => {
        return (
          String(s.swapId || '').toLowerCase().includes(q) ||
          String(s.userName || s.user?.name || '').toLowerCase().includes(q) ||
          String(s.licensePlate || s.license || s.vehicle?.license_plate || '').toLowerCase().includes(q)
        );
      });
    }

    // sorting
    const sorted = searched.slice().sort((a, b) => {
      const aRaw = a[sortField];
      const bRaw = b[sortField];
      // date fields
      if (sortField === 'swappedAt' || sortField === 'createdAt') {
        const aTime = new Date(aRaw || 0).getTime() || 0;
        const bTime = new Date(bRaw || 0).getTime() || 0;
        return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
      }
      const A = String(aRaw || '').toLowerCase();
      const B = String(bRaw || '').toLowerCase();
      if (A < B) return sortOrder === 'asc' ? -1 : 1;
      if (A > B) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [rawSwaps, filterStatus, search, dateFilter, customDateFrom, customDateTo, sortField, sortOrder]);

  const handleApprove = async (swapId) => {
    try {
      await toast.promise(completedSwap({ swapId }).unwrap(), {
        loading: 'Đang kiểm tra...',
        success: 'Xác nhận hoàn tất giao dịch',
        error: (e) => e?.data?.message || 'Xác nhận thất bại',
      });
      await refetch();
    } catch (err) { }
  };

  const handleReject = async (swapId) => {
    const reason = prompt('Lý do từ chối (bắt buộc):');
    if (!reason) return toast.error('Cần phải nhập lý do từ chối');
    try {
      await toast.promise(rejectSwap({ swapId, reason }).unwrap(), {
        loading: 'Đang từ chối...',
        success: 'Từ chối thành công',
        error: (e) => e?.data?.message || 'Từ chối thất bại',
      });
      await refetch();
    } catch (err) { }
  };

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">Danh sách chờ hoàn tất giao dịch (Trạm: {stationNameFromSwaps})</h1>

      {!stationId ? (
        <div className="text-gray-500 italic">Không xác định được trạm của bạn...</div>
      ) : (
        <>
          {/* Filters */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm swapId, tên tài xế, biển số..."
              className="border rounded px-3 py-2 text-sm w-64"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="All">Lọc tất cả trạng thái</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select value={sortField} onChange={(e) => setSortField(e.target.value)} className="border rounded px-3 py-2 text-sm">
              <option value="swappedAt">Thời gian đổi</option>
              <option value="createdAt">Thời gian tạo</option>
              {/* <option value="userName">Tên tài xế</option> */}
            </select>
            <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="px-3 py-2 border rounded text-sm">{sortOrder === 'asc' ? '↑ Tăng dần' : '↓ Giảm dần'}</button>

            <button
              onClick={() => refetch && refetch()}
              className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
            >
              Làm mới
            </button>
          </div>

          {/* Date filter + sort */}
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

          {/* Content */}
          {isLoading ? (
            <div>Đang tải...</div>
          ) : swaps.length === 0 ? (
            <div className="p-6 text-center text-gray-400 bg-white rounded-xl shadow">Không có giao dịch chờ duyệt</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {swaps.map((s) => (
                <SwapCard key={s.swapId || s.id} s={s} onApprove={handleApprove} onReject={handleReject} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
