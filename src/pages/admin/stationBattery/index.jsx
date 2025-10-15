import React, { useState } from 'react';

const mockBatteries = [
  { id: 'BAT001', type: 'Lithium', status: 'sẵn sàng', importedAt: '2025-10-01', exportedAt: '', location: 'Kệ 1' },
  { id: 'BAT002', type: 'Lithium', status: 'đang sạc', importedAt: '2025-10-02', exportedAt: '', location: 'Kệ 2' },
  { id: 'BAT003', type: 'Lithium', status: 'đang sử dụng', importedAt: '2025-10-03', exportedAt: '2025-10-10', location: 'Đang sử dụng' },
  { id: 'BAT004', type: 'Lithium', status: 'hỏng', importedAt: '2025-10-04', exportedAt: '', location: 'Kho bảo trì' },
  { id: 'BAT005', type: 'Lithium', status: 'sẵn sàng', importedAt: '2025-10-05', exportedAt: '', location: 'Kệ 3' },
];

const statusOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'sẵn sàng', label: 'Sẵn sàng' },
  { value: 'đang sạc', label: 'Đang sạc' },
  { value: 'đang sử dụng', label: 'Đang sử dụng' },
  { value: 'hỏng', label: 'Hỏng' },
];

const statusColor = {
  'sẵn sàng': 'bg-green-100 text-green-700',
  'đang sạc': 'bg-blue-100 text-blue-700',
  'đang sử dụng': 'bg-yellow-100 text-yellow-700',
  'hỏng': 'bg-red-100 text-red-700',
};

const StationBattery = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const filtered = mockBatteries.filter(b =>
    (status === '' || b.status === status) &&
    (search === '' || b.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">Điều phối pin cho trạm</h1>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm mã pin..."
          className="border rounded px-3 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2 w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="rounded-lg shadow bg-white overflow-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3">Mã pin</th>
              <th className="p-3">Loại pin</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Ngày nhập</th>
              <th className="p-3">Ngày xuất</th>
              <th className="p-3">Vị trí</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">Không có dữ liệu</td>
              </tr>
            ) : (
              filtered.map(b => (
                <tr key={b.id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-medium text-gray-800">{b.id}</td>
                  <td className="p-3 text-gray-600">{b.type}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor[b.status]}`}>{b.status}</span>
                  </td>
                  <td className="p-3 text-gray-600">{b.importedAt}</td>
                  <td className="p-3 text-gray-600">{b.exportedAt || '-'}</td>
                  <td className="p-3 text-gray-600">{b.location}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StationBattery;