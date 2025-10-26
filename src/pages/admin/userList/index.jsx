import React, { useState } from 'react';

const mockUsers = [
  { id: 1, full_name: 'Nguyễn Văn A', email: 'a@gmail.com', phone: '0901234567', role: 'admin', status: 'active', created_at: '2025-10-01' },
  { id: 2, full_name: 'Trần Thị B', email: 'b@gmail.com', phone: '0902345678', role: 'staff', status: 'inactive', created_at: '2025-10-02' },
  { id: 3, full_name: 'Lê Văn C', email: 'c@gmail.com', phone: '0903456789', role: 'driver', status: 'active', created_at: '2025-10-03' },
  { id: 4, full_name: 'Phạm Thị D', email: 'd@gmail.com', phone: '0904567890', role: 'staff', status: 'active', created_at: '2025-10-04' },
];

const statusColor = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-red-100 text-red-700',
};

const roleLabel = {
  admin: 'Quản trị',
  staff: 'Nhân viên',
  driver: 'Tài xế',
};

const UserList = () => {
  const [users] = useState(mockUsers);

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">Danh sách người dùng</h1>
      <div className="rounded-lg shadow bg-white overflow-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3">Họ tên</th>
              <th className="p-3">Email</th>
              <th className="p-3">Số điện thoại</th>
              <th className="p-3">Vai trò</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">Không có dữ liệu</td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-medium text-gray-800">{u.full_name}</td>
                  <td className="p-3 text-gray-600">{u.email}</td>
                  <td className="p-3 text-gray-600">{u.phone}</td>
                  <td className="p-3 text-gray-600">{roleLabel[u.role] || u.role}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor[u.status]}`}>{u.status === 'active' ? 'Hoạt động' : 'Ngưng'}</span>
                  </td>
                  <td className="p-3 text-gray-600">{u.created_at}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;