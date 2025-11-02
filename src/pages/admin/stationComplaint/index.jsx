import React, { useState } from 'react';

const mockComplaints = [
  { id: 'CMP001', batteryId: 'BAT001', user: 'Nguyễn Văn A', content: 'Pin không sạc được', status: 'chờ xử lý', createdAt: '2025-10-10' },
  { id: 'CMP002', batteryId: 'BAT003', user: 'Trần Thị B', content: 'Pin bị nóng bất thường', status: 'đã xử lý', createdAt: '2025-10-11' },
  { id: 'CMP003', batteryId: 'BAT002', user: 'Lê Văn C', content: 'Pin không nhận sạc', status: 'chờ xử lý', createdAt: '2025-10-12' },
  { id: 'CMP004', batteryId: 'BAT004', user: 'Phạm Thị D', content: 'Pin bị phồng', status: 'từ chối', createdAt: '2025-10-13' },
];

const statusOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'chờ xử lý', label: 'Chờ xử lý' },
  { value: 'đã xử lý', label: 'Đã xử lý' },
  { value: 'từ chối', label: 'Từ chối' },
];

const statusColor = {
  'chờ xử lý': 'bg-yellow-100 text-yellow-700',
  'đã xử lý': 'bg-green-100 text-green-700',
  'từ chối': 'bg-red-100 text-red-700',
};

const StationComplaint = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [complaints, setComplaints] = useState(mockComplaints);

  const filtered = complaints.filter(c =>
    (status === '' || c.status === status) &&
    (search === '' || c.batteryId.toLowerCase().includes(search.toLowerCase()) || c.user.toLowerCase().includes(search.toLowerCase()))
  );

  const handleResolve = (id) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'đã xử lý' } : c));
  };
  const handleReject = (id) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'từ chối' } : c));
  };

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">Xử lý khiếu nại &amp; đổi pin lỗi</h1>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm mã pin hoặc người gửi..."
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

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-white rounded-lg shadow">Không có dữ liệu</div>
        ) : (
          filtered.map(c => (
            <div key={c.id} className="bg-white rounded-lg shadow p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-gray-100">
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="font-semibold text-gray-800">#{c.id}</span>
                  <span className="text-gray-500">|</span>
                  <span className="text-sm text-gray-600">Mã pin: <span className="font-medium">{c.batteryId}</span></span>
                  <span className="text-gray-500">|</span>
                  <span className="text-sm text-gray-600">Người gửi: <span className="font-medium">{c.user}</span></span>
                  <span className="text-gray-500">|</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor[c.status]}`}>{c.status}</span>
                </div>
                <div className="text-gray-700 mt-1"><span className="font-medium">Nội dung:</span> {c.content}</div>
                <div className="text-xs text-gray-400 mt-1">Ngày gửi: {c.createdAt}</div>
              </div>
              <div className="flex gap-2 md:flex-col md:items-end">
                {c.status === 'chờ xử lý' ? (
                  <>
                    <button
                      onClick={() => handleResolve(c.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                    >
                      Đổi pin mới
                    </button>
                    <button
                      onClick={() => handleReject(c.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                    >
                      Từ chối
                    </button>
                  </>
                ) : (
                  <span className="text-gray-400 text-xs">Không khả dụng</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StationComplaint;