import React, { useState } from 'react';

// Dữ liệu mock tổng hợp từ các bảng liên quan
const mockBookings = [
  {
    booking_id: 'BK001',
    created_at: '2025-10-17 08:30',
    user: { full_name: 'Nguyễn Văn A', phone: '0901234567', email: 'a@gmail.com' },
    vehicle: { model: 'VF e34', license_plate: '51A-12345' },
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

const SwapConfirm = () => {
  const [bookings, setBookings] = useState(mockBookings);

  const handleApprove = (id) => {
    setBookings(prev => prev.filter(b => b.booking_id !== id));
    alert('Đã xác nhận đổi pin cho booking ' + id);
  };
  const handleReject = (id) => {
    setBookings(prev => prev.filter(b => b.booking_id !== id));
    alert('Đã từ chối booking ' + id);
  };

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">Danh sách chờ duyệt đổi pin</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bookings.length === 0 ? (
          <div className="p-6 text-center text-gray-400 bg-white rounded-xl shadow col-span-2">Không có booking chờ duyệt</div>
        ) : (
          bookings.map(bk => (
            <div key={bk.booking_id} className="bg-white rounded-xl shadow p-6 flex flex-col gap-3 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-blue-700 text-lg">#{bk.booking_id}</div>
                <div className="text-xs text-gray-400">{bk.created_at}</div>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <div><span className="font-semibold">Tài xế:</span> {bk.user.full_name} - {bk.user.phone}</div>
                <div><span className="font-semibold">Xe:</span> {bk.vehicle.model} - {bk.vehicle.license_plate}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {/* Pin khách đặt */}
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <div className="font-semibold text-gray-700 mb-1">Pin khách đặt</div>
                  <div className="text-xs text-gray-500 mb-1">Mã pin: <span className="font-semibold text-gray-800">{bk.battery_return.battery_id}</span></div>
                  <div className="text-xs text-gray-500 mb-1">Loại: {bk.battery_return.type}</div>
                  <div className="text-xs text-gray-500 mb-1">Trạng thái: <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor[bk.battery_return.status]}`}>{bk.battery_return.status}</span></div>
                  <div className="text-xs text-gray-500">{bk.battery_return.voltage} - {bk.battery_return.capacity_wh} Wh</div>
                </div>
                {/* Pin trạm sẽ cấp */}
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <div className="font-semibold text-gray-700 mb-1">Pin trạm sẽ cấp</div>
                  <div className="text-xs text-gray-500 mb-1">Mã pin: <span className="font-semibold text-gray-800">{bk.battery_give.battery_id}</span></div>
                  <div className="text-xs text-gray-500 mb-1">Loại: {bk.battery_give.type}</div>
                  <div className="text-xs text-gray-500 mb-1">Trạng thái: <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor[bk.battery_give.status]}`}>{bk.battery_give.status}</span></div>
                  <div className="text-xs text-gray-500">{bk.battery_give.voltage} - {bk.battery_give.capacity_wh} Wh</div>
                </div>
              </div>
              <div className="flex gap-3 mt-4 justify-end">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-semibold"
                  onClick={() => handleApprove(bk.booking_id)}
                >Xác nhận đổi pin</button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-semibold"
                  onClick={() => handleReject(bk.booking_id)}
                >Từ chối</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SwapConfirm;