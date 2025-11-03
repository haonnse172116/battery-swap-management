import React from 'react';
import { useConfirmSwapMutation, useRejectSwapMutation } from '@/services/staffManagementBattery.service';
import { useGetSwapsByStationQuery } from '@/services/batterySwap.service';
import { useGetStationsQuery } from '@/services/station.service';
import { useGetPaymentByIdQuery } from '@/services/payment.service';
import toast from 'react-hot-toast';

const statusColor = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  Completed: 'bg-blue-100 text-blue-700',
};

function SwapCard({ s, onApprove, onReject }) {
  // fetch payment (hook at top level of this component)
  const paymentId = s.paymentId || null;
  const { data: paymentData } = useGetPaymentByIdQuery({ paymentId }, { skip: !paymentId });
  const amount = paymentData?.content?.amount ?? paymentData?.amount ?? '—';

  const swappedAt = s.swappedAt || s.createdAt || '';
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
        <div><span className="font-semibold">Tài xế:</span> {userName} - {userPhone}</div>
        <div><span className="font-semibold">Xe:</span> {vehicle} - {license}</div>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-2">
        <div className="bg-gray-50 rounded-lg p-3 border">
          <div className="font-semibold text-gray-700 mb-1">Pin đã đổi</div>
          <div className="text-xs text-gray-500 mb-1">Mã pin: <span className="font-semibold text-gray-800">{batteryId}</span></div>
          <div className="text-xs text-gray-500 mb-1">Serial: <span className="font-semibold">{s.batterySerial || '—'}</span></div>
          <div className="text-xs text-gray-500 mb-1">Trạng thái: <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor[s.status]}`}>{s.status}</span></div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <span className="text-gray-700 font-semibold">Tổng tiền thanh toán:</span>
          <span className="text-green-700 font-bold text-lg">{amount === '—' ? '—' : `${amount} VNĐ`}</span>
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
          <button className="px-4 py-2 bg-orange-500 text-white rounded text-sm font-semibold cursor-not-allowed" disabled>
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
  const [stationId, setStationId] = React.useState('');

  const { data: stationsData } = useGetStationsQuery({ page: 1, pageSize: 100 });

  // <-- CALL API ONLY WHEN stationId IS TRUTHY -->
  const { data, isLoading, refetch } = useGetSwapsByStationQuery(
    { stationId, page: 1, pageSize: 10000 },
    { skip: !stationId }
  );

  const [confirmSwap] = useConfirmSwapMutation();
  const [rejectSwap] = useRejectSwapMutation();

  const swaps = data?.content || [];

  const handleApprove = async (swapId) => {
    try {
      await toast.promise(confirmSwap({ swapId }).unwrap(), {
        loading: 'Đang xác nhận...',
        success: 'Xác nhận thành công',
        error: (e) => e?.data?.message || 'Xác nhận thất bại',
      });
      await refetch();
    } catch (err) {}
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
    } catch (err) {}
  };

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">Danh sách chờ xác nhận giao dịch</h1>

      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Chọn trạm:</label>
        <select
          value={stationId}
          onChange={(e) => setStationId(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">-- Chọn trạm --</option>
          {(stationsData?.content || []).map((st) => (
            <option key={st.stationId || st.id} value={st.stationId || st.id}>
              {st.name || st.stationName || st.address || st.id}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div>Đang tải...</div>
        ) : swaps.length === 0 ? (
          <div className="p-6 text-center text-gray-400 bg-white rounded-xl shadow col-span-2">Không có giao dịch chờ duyệt</div>
        ) : (
          swaps.map(s => (
            <SwapCard key={s.swapId || s.id} s={s} onApprove={handleApprove} onReject={handleReject} />
          ))
        )}
      </div>
    </div>
  );
};
