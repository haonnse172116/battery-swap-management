import React, { useState } from 'react';

// Dữ liệu mock lịch sử giao dịch đã thanh toán
const mockHistory = [
  {
    booking_id: 'BK001',
    paid_at: '2025-10-17 10:00',
    user: { full_name: 'Nguyễn Văn A', phone: '0901234567', email: 'a@gmail.com' },
    vehicle: { model: 'VF e34', license_plate: '51A-12345' },
    amount: 150000,
    method: 'QR PayOS',
    battery_return: {
      battery_id: 'BAT001',
      type: 'Lithium',
    },
    battery_give: {
      battery_id: 'BAT010',
      type: 'Lithium',
    },
  },
  {
    booking_id: 'BK002',
    paid_at: '2025-10-17 11:20',
    user: { full_name: 'Trần Thị B', phone: '0902345678', email: 'b@gmail.com' },
    vehicle: { model: 'VinFast Klara', license_plate: '59B1-67890' },
    amount: 120000,
    method: 'Tiền mặt',
    battery_return: {
      battery_id: 'BAT002',
      type: 'Lithium',
    },
    battery_give: {
      battery_id: 'BAT011',
      type: 'Lithium',
    },
  },
];

const TransactionHistory = () => {
  const [history] = useState(mockHistory);

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">Lịch sử giao dịch đã thanh toán</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {history.length === 0 ? (
          <div className="p-6 text-center text-gray-400 bg-white rounded-xl shadow col-span-2">Chưa có giao dịch nào</div>
        ) : (
          history.map(tran => (
            <div key={tran.booking_id} className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-blue-700 text-lg">#{tran.booking_id}</div>
                <div className="text-xs text-gray-400">{tran.paid_at}</div>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex flex-wrap gap-4">
                  <div>
                    <span className="font-semibold">Khách:</span> {tran.user.full_name}
                  </div>
                  <div>
                    <span className="font-semibold">SĐT:</span> {tran.user.phone}
                  </div>
                  <div>
                    <span className="font-semibold">Email:</span> {tran.user.email}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <span className="font-semibold">Xe:</span> {tran.vehicle.model}
                  </div>
                  <div>
                    <span className="font-semibold">Biển số:</span> {tran.vehicle.license_plate}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {/* Pin khách đặt */}
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <div className="font-semibold text-gray-700 mb-1">Pin khách đặt</div>
                  <div className="text-xs text-gray-500 mb-1">Mã pin: <span className="font-semibold text-gray-800">{tran.battery_return.battery_id}</span></div>
                  <div className="text-xs text-gray-500 mb-1">Loại: {tran.battery_return.type}</div>
                </div>
                {/* Pin trạm đã cấp */}
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <div className="font-semibold text-gray-700 mb-1">Pin trạm đã cấp</div>
                  <div className="text-xs text-gray-500 mb-1">Mã pin: <span className="font-semibold text-gray-800">{tran.battery_give.battery_id}</span></div>
                  <div className="text-xs text-gray-500 mb-1">Loại: {tran.battery_give.type}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 justify-end">
                <span className="text-gray-700 font-semibold">Tổng số tiền:</span>
                <span className="text-green-700 font-bold text-lg">{tran.amount.toLocaleString()} VNĐ</span>
                <span className="ml-4 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{tran.method}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;