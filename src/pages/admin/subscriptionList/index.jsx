import React from 'react';

const mockSubscriptions = [
  {
    id: 1,
    name: "Gói tiết kiệm",
    description: "Phù hợp cho nhu cầu cơ bản, giá rẻ.",
    monthly_fee: 120000,
    swapAmount: 2,
    active: true,
  },
  {
    id: 2,
    name: "Gói linh hoạt",
    description: "Đổi pin nhiều lần, phù hợp di chuyển nhiều.",
    monthly_fee: 180000,
    swapAmount: 5,
    active: true,
  },
  {
    id: 3,
    name: "Gói cao cấp",
    description: "Ưu đãi đặc biệt, dịch vụ tốt nhất.",
    monthly_fee: 250000,
    swapAmount: 10,
    active: false,
  },
];

const SubscriptionList = () => {
  const activeSubs = mockSubscriptions.filter(sub => sub.active);

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">Danh sách gói thuê pin đang kích hoạt</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeSubs.length === 0 ? (
          <div className="p-6 text-center text-gray-400 bg-white rounded-xl shadow col-span-3">Không có gói nào đang kích hoạt</div>
        ) : (
          activeSubs.map(sub => (
            <div key={sub.id} className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-green-700 text-lg">{sub.name}</div>
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Kích hoạt</span>
              </div>
              <div className="text-gray-600 text-sm mb-1">{sub.description}</div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                <span>Giá thuê: <span className="font-semibold">{sub.monthly_fee.toLocaleString()} VNĐ</span></span>
                <span>Số lượt đổi pin: <span className="font-semibold">{sub.swapAmount}</span></span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SubscriptionList;