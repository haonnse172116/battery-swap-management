import React, { useState } from 'react';

// Dữ liệu mock booking đã duyệt, chờ thanh toán (bổ sung pin)
const mockTransactions = [
  {
    booking_id: 'BK001',
    created_at: '2025-10-17 08:30',
    user: { full_name: 'Nguyễn Văn A', phone: '0901234567', email: 'a@gmail.com' },
    vehicle: { model: 'VF e34', license_plate: '51A-12345' },
    amount: 150000,
    battery_return: {
      battery_id: 'BAT001',
      type: 'Lithium',
      status: 'đang sử dụng',
      voltage: '48V',
      capacity_wh: '3200',
    },
    battery_give: {
      battery_id: 'BAT010',
      type: 'Lithium',
      status: 'sẵn sàng',
      voltage: '48V',
      capacity_wh: '3200',
    },
  },
  {
    booking_id: 'BK002',
    created_at: '2025-10-17 09:10',
    user: { full_name: 'Trần Thị B', phone: '0902345678', email: 'b@gmail.com' },
    vehicle: { model: 'VinFast Klara', license_plate: '59B1-67890' },
    amount: 120000,
    battery_return: {
      battery_id: 'BAT002',
      type: 'Lithium',
      status: 'đang sử dụng',
      voltage: '48V',
      capacity_wh: '2800',
    },
    battery_give: {
      battery_id: 'BAT011',
      type: 'Lithium',
      status: 'sẵn sàng',
      voltage: '48V',
      capacity_wh: '2800',
    },
  },
];
const statusColor = {
  'sẵn sàng': 'bg-green-100 text-green-700',
  'đang sử dụng': 'bg-yellow-100 text-yellow-700',
  'đang sạc': 'bg-blue-100 text-blue-700',
  'hỏng': 'bg-red-100 text-red-700',
};

const TransactionConfirm = () => {

  const [transactions, setTransactions] = useState(mockTransactions);
  const [openMenu, setOpenMenu] = useState(null); // booking_id nếu đang mở menu

  const handlePayCash = (id) => {
    setTransactions(prev => prev.filter(t => t.booking_id !== id));
    alert('Đã xác nhận thanh toán tiền mặt cho booking ' + id);
    setOpenMenu(null);
  };
  const handlePayQR = (id) => {
    setTransactions(prev => prev.filter(t => t.booking_id !== id));
    alert('Mở trang thanh toán PayOS cho booking ' + id);
    setOpenMenu(null);
    // window.open('https://payos.vn/checkout?booking=' + id, '_blank');
  };
  const handleCancel = (id) => {
    setTransactions(prev => prev.filter(t => t.booking_id !== id));
    alert('Đã hủy giao dịch booking ' + id);
    setOpenMenu(null);
  };

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">Danh sách giao dịch chờ thanh toán</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-400 bg-white rounded-xl shadow col-span-2">Không có giao dịch chờ thanh toán</div>
        ) : (
          transactions.map(tran => (
            <div key={tran.booking_id} className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 border border-gray-100 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-blue-700 text-lg">#{tran.booking_id}</div>
                <div className="text-xs text-gray-400">{tran.created_at}</div>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex flex-wrap gap-4">
                  <div>
                    <span className="font-semibold">Tài xế:</span> {tran.user.full_name}
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
                  <div className="text-xs text-gray-500 mb-1">Trạng thái: <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor[tran.battery_return.status]}`}>{tran.battery_return.status}</span></div>
                  <div className="text-xs text-gray-500">{tran.battery_return.voltage} - {tran.battery_return.capacity_wh} Wh</div>
                </div>
                {/* Pin trạm sẽ cấp */}
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <div className="font-semibold text-gray-700 mb-1">Pin trạm sẽ cấp</div>
                  <div className="text-xs text-gray-500 mb-1">Mã pin: <span className="font-semibold text-gray-800">{tran.battery_give.battery_id}</span></div>
                  <div className="text-xs text-gray-500 mb-1">Loại: {tran.battery_give.type}</div>
                  <div className="text-xs text-gray-500 mb-1">Trạng thái: <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor[tran.battery_give.status]}`}>{tran.battery_give.status}</span></div>
                  <div className="text-xs text-gray-500">{tran.battery_give.voltage} - {tran.battery_give.capacity_wh} Wh</div>
                </div>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <span className="text-gray-700 font-semibold">Tổng tiền thanh toán:</span>
                <span className="text-green-700 font-bold text-lg">{tran.amount.toLocaleString()} VNĐ</span>
              </div>
              <div className="flex gap-3 mt-4 justify-end">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-semibold"
                  onClick={() => handleCancel(tran.booking_id)}
                >Hủy giao dịch</button>
                <div className="relative">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold"
                    onClick={() => setOpenMenu(openMenu === tran.booking_id ? null : tran.booking_id)}
                  >Thanh toán</button>
                  {openMenu === tran.booking_id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                        onClick={() => handlePayCash(tran.booking_id)}
                      >Thanh toán bằng tiền mặt</button>
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-blue-700"
                        onClick={() => handlePayQR(tran.booking_id)}
                      >Thanh toán bằng QR (PayOS)</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionConfirm;