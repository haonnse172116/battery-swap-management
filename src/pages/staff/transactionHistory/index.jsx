import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useGetStationStaffByUserIdQuery } from '@/services/stationStaff.service';
import { useGetSwapsByStationQuery } from '@/services/batterySwap.service';
import { useGetPaymentByIdQuery } from '@/services/payment.service';
import { useGetBatteriesByIdQuery } from '@/services/battery.service';
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

function CompletedSwapCard({ s }) {
  const paymentId = s.paymentId || null;
  const { data: paymentData } = useGetPaymentByIdQuery({ paymentId }, { skip: !paymentId });
  const amount = paymentData?.content?.amount ?? paymentData?.amount ?? '—';

  const paymentMethod =
    paymentData?.content?.paymentMethod ||
    paymentData?.paymentMethod ||
    '—';

  const swappedAt = s.swappedAt ? new Date(s.swappedAt).toLocaleString() : (s.createdAt ? new Date(s.createdAt).toLocaleString() : '');
  const swapId = s.swapId || s.id || '—';
  const userName = s.userName || s.user?.name || '—';
  const userPhone = s.userPhone || s.user?.phone || '—';
  const vehicle = `${s.vehicleBrand || ''} ${s.vehicleModel || ''}`.trim();
  const license = s.licensePlate || '—';
  const batteryId = s.batteryId || '—';

  // helper translate payment method to user-friendly label
  const getPaymentMethodLabel = (method) => {
    if (!method || method === '—') return 'Chưa có phương thức thanh toán';
    const m = String(method).toLowerCase();
    if (m === 'Card') {
      return 'Thanh toán bằng e-bank/QR';
    }
    if (m === 'Subscription_Plan') {
      return 'Thanh toán bằng gói đăng ký';
    }
    // fallback: giữ nguyên tên nhưng đưa ra mô tả chung
    return `${method}`;
  };

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
          <div className="text-xs text-gray-500 mb-1">Mã pin: <span className="font-semibold text-gray-800">{batteryId}</span></div>
          <div className="text-xs text-gray-500 mb-1">Serial: <span className="font-semibold">{s.batterySerial ?? '—'}</span></div>
          <div className="text-xs text-gray-500 mb-1">Trạng thái: <span className="font-semibold">{s.status}</span></div>
          {batteryId && <BatteryDetails batteryId={batteryId} />}
        </div>

         <div className="flex items-center gap-2 justify-end flex-wrap">
          <div className="text-right">
            <div className="text-gray-700 font-semibold">Tổng tiền thanh toán:<span className="text-green-700 font-bold text-lg"> {formatPrice(amount)}</span></div>
            <div className="ml-4 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 w-fit inline-block">{getPaymentMethodLabel(paymentMethod)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TransactionHistory() {
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

  // derive station name from swaps if present
  const stationNameFromSwaps = data?.content?.[0]?.stationName || '[không có tên trạm]';

  // raw swaps (from API)
  const rawSwaps = data?.content || [];

  // local UI filters & sort
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [sortField, setSortField] = useState('swappedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // prepare list for DateFilter: only include non-completed? for history we WANT completed only
  const completedOnlyForDate = rawSwaps
    .filter((s) => String(s.status || '').toLowerCase() === 'completed')
    .map((s) => ({ ...s, timeSlot: s.swappedAt || s.createdAt || null }));

  // filtered & sorted final list (only Completed)
  const swaps = useMemo(() => {
    // start with only Completed (case-insensitive)
    const completed = rawSwaps.filter((s) => String(s.status || '').toLowerCase() === 'completed');

    // apply date filtering using bookingsForDate (already mapped above)
    const dateFiltered = filterBookingsByDate(
      // keep objects from completed that match booking entries (preserve fields)
      completed.map((s) => ({ ...s, timeSlot: s.swappedAt || s.createdAt || null })),
      dateFilter,
      customDateFrom,
      customDateTo
    );

    // search (swapId, userName, licensePlate, stationName)
    const q = (search || '').trim().toLowerCase();
    let searched = dateFiltered;
    if (q) {
      searched = dateFiltered.filter((s) => {
        return (
          String(s.swapId || s.id || '').toLowerCase().includes(q) ||
          String(s.userName || s.user?.name || '').toLowerCase().includes(q) ||
          String(s.licensePlate || s.vehicle?.license_plate || '').toLowerCase().includes(q) ||
          String(s.stationName || s.station_id || s.stationId || '').toLowerCase().includes(q)
        );
      });
    }

    // sorting
    const sorted = searched.slice().sort((a, b) => {
      const aRaw = a[sortField];
      const bRaw = b[sortField];
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
  }, [rawSwaps, search, dateFilter, customDateFrom, customDateTo, sortField, sortOrder]);

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        Lịch sử giao dịch (Trạm: {stationNameFromSwaps})
      </h1>

      {!stationId ? (
        <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-300 text-sm text-yellow-800 rounded">
          Hệ thống không xác định được trạm của bạn — không thể load lịch sử riêng cho trạm. Vui lòng liên hệ admin hoặc kiểm tra gán trạm.
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm swapId, tên tài xế, biển số, trạm..."
              className="border rounded px-3 py-2 text-sm w-64"
            />
            <select value={sortField} onChange={(e) => setSortField(e.target.value)} className="border rounded px-3 py-2 text-sm">
              <option value="swappedAt">Thời gian đổi</option>
              <option value="createdAt">Thời gian tạo</option>
              <option value="userName">Tên tài xế</option>
            </select>
            <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="px-3 py-2 border rounded text-sm">{sortOrder === 'asc' ? '↑ Tăng dần' : '↓ Giảm dần'}</button>

            <button
              onClick={() => refetch && refetch()}
              className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
            >
              Làm mới
            </button>
          </div>

          {/* Date filter */}
          <div className="mb-4">
            <DateFilter
              bookings={completedOnlyForDate}
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
            <div className="p-6 text-center text-gray-400 bg-white rounded-xl shadow">Không tìm thấy giao dịch đã hoàn tất</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {swaps.map((s) => (
                <CompletedSwapCard key={s.swapId || s.id || Math.random()} s={s} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
