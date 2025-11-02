import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDebounce } from '../../../hooks/useDebounce';
import { useGetUsersQuery, usePromoteToStaffMutation, useDemoteToUserMutation } from '../../../services/userManagement.service';
import toast from 'react-hot-toast';

const roleLabel = {
  Admin: 'Quản trị',
  Staff: 'Nhân viên',
  Driver: 'Tài xế',
};

function Avatar({ name, url }) {
  if (url) return <img src={url} alt={name} className="w-20 h-20 rounded-full object-cover" />;
  const initials = name ? name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase() : 'U';
  return (
    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-xl text-gray-700">{initials}</div>
  );
}

const UserList = () => {
  const token = useSelector(state => state.auth.accessToken);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [roleFilter, setRoleFilter] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);

  const [promoteToStaff, { isLoading: isPromoting }] = usePromoteToStaffMutation();
  const [demoteToUser, { isLoading: isDemoting }] = useDemoteToUserMutation();

  const { data, isLoading, isError, refetch } = useGetUsersQuery({ page, pageSize, search: debouncedSearch, role: roleFilter || null, token });

  const users = data?.content || [];
  const pagination = data?.pagination || { page: page, totalCount: users.length, pageSize };

  const sortedUsers = useMemo(() => {
    const copy = [...users];
    copy.sort((a, b) => {
      const aVal = (a[sortField] || '').toString().toLowerCase();
      const bVal = (b[sortField] || '').toString().toLowerCase();
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [users, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil((pagination.totalCount || users.length) / (pagination.pageSize || pageSize)));

  const onSortClick = (field) => {
    if (sortField === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('asc'); }
  };

  const handlePromote = async () => {
    if (!selectedUser) return;
    // Admin cannot be changed
    if (selectedUser.role === 'Admin') {
      toast.error('Quyền hạn quản trị viên không thể thay đổi');
      return;
    }
    // If already Staff, cannot promote further in this flow
    if (selectedUser.role === 'Staff') {
      toast('Bậc người dùng đã lên giới hạn');
      return;
    }

    try {
      const p = promoteToStaff({ userId: selectedUser.userId, token }).unwrap();
      toast.promise(p, {
        loading: 'Đang xử lý...',
        success: 'Đã tăng bậc người dùng',
        error: (err) => err?.data?.message || 'Lỗi khi thay đổi quyền'
      });
      await p;
      refetch();
      setShowDrawer(false);
    } catch (e) {
      // handled by toast.promise
    }
  };

  const handleDemote = async () => {
    if (!selectedUser) return;
    if (selectedUser.role === 'Admin') {
      toast.error('Quyền hạn quản trị viên không thể thay đổi');
      return;
    }
    // If already Driver, cannot demote further
    if (selectedUser.role === 'Driver') {
      toast('Bậc người dùng đã xuống giới hạn');
      return;
    }

    try {
      const p = demoteToUser({ userId: selectedUser.userId, token }).unwrap();
      toast.promise(p, {
        loading: 'Đang xử lý...',
        success: 'Đã giảm bậc người dùng',
        error: (err) => err?.data?.message || 'Lỗi khi thay đổi quyền'
      });
      await p;
      refetch();
      setShowDrawer(false);
    } catch (e) {
      // handled by toast.promise
    }
  };

  return (
    <div className="p-6 min-h-screen flex flex-col">
      <div className="mb-4 flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Danh sách người dùng</h1>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm kiếm theo tên hoặc email..."
            className="border rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} className="border rounded px-3 py-2">
            <option value="">Tất cả vai trò</option>
            <option value="Admin">Quản trị</option>
            <option value="Driver">Tài xế</option>
            <option value="Staff">Nhân viên</option>
          </select>
          <div className="flex items-center gap-2">
            <select
              value={sortField}
              onChange={e => setSortField(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="fullName">Sắp xếp theo Họ tên</option>
              <option value="email">Sắp xếp theo Email</option>
              <option value="createdAt">Sắp xếp theo Ngày tạo</option>
            </select>

            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border rounded text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {sortOrder === 'asc' ? '↑ Tăng dần' : '↓ Giảm dần'}
            </button>

          </div>
          <button
            onClick={() => { setPage(1); refetch(); }}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Làm mới
          </button>
        </div>
      </div>

      <div className="rounded-lg shadow bg-white overflow-hidden flex-1 flex flex-col">
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 170px)' }}>
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-100 border-b sticky top-0">
              <tr>
                <th className="p-3 cursor-pointer" onClick={() => onSortClick('fullName')}>Họ tên</th>
                <th className="p-3">Email</th>
                <th className="p-3">Vai trò</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 cursor-pointer" onClick={() => onSortClick('createdAt')}>Ngày tạo</th>
                <th className="p-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="p-6 text-center">Đang tải...</td></tr>
              ) : isError ? (
                <tr><td colSpan={6} className="p-6 text-center text-red-600">Lỗi khi tải dữ liệu</td></tr>
              ) : sortedUsers.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-500">Không có dữ liệu</td></tr>
              ) : (
                sortedUsers.map(u => (
                  <tr key={u.userId} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-medium text-gray-800">{u.fullName}</td>
                    <td className="p-3 text-gray-600">{u.email}</td>
                    <td className="p-3 text-gray-600">{roleLabel[u.role] || u.role}</td>
                    <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.status}</span></td>
                    <td className="p-3 text-gray-600">{new Date(u.createdAt).toLocaleString()}</td>
                    <td className="p-3">
                      <button onClick={() => { setSelectedUser(u); setShowDrawer(true); }} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Xem chi tiết</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* pagination area - placed below table and visible at bottom */}
        <div className="p-4 border-t bg-white flex items-center justify-between">
          <div className="text-sm text-gray-600">Tổng: {users.length} người</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border rounded disabled:opacity-50">Trước</button>
            <div className="px-3 py-1">{page} / {totalPages}</div>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Sau</button>
          </div>
        </div>
      </div>

      {/* Drawer for user detail */}
      {showDrawer && selectedUser && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity duration-900"
            onClick={() => setShowDrawer(false)}
          ></div>

          {/* Drawer Panel */}
          <div
            className={`ml-auto h-full w-full max-w-md bg-white shadow-2xl p-6 overflow-auto relative transform transition-transform duration-500 ease-in-out ${showDrawer ? 'translate-x-0' : 'translate-x-full'
              }`}
            style={{ zIndex: 60 }}
          >
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Chi tiết người dùng</h2>
              <button
                className="text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => setShowDrawer(false)}
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar name={selectedUser.fullName} url={selectedUser.avatarUrl} />
                <div>
                  <div className="font-semibold text-lg text-gray-800">
                    {selectedUser.fullName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedUser.role}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600">UserId</div>
                <div className="font-medium">{selectedUser.userId}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <div className="font-medium">{selectedUser.email}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Số điện thoại</div>
                <div className="font-medium">{selectedUser.phone || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Trạng thái</div>
                <div className="font-medium">{selectedUser.status}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Ngày tạo</div>
                <div className="font-medium">
                  {new Date(selectedUser.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 items-center justify-evenly">
              <button
                onClick={handlePromote}
                disabled={selectedUser.role === 'Admin' || isPromoting}
                title={selectedUser.role === 'Admin' ? 'Quyền hạn quản trị viên không thể thay đổi' : ''}
                className={`p-2 rounded transition-colors ${selectedUser.role === 'Admin' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-green-200 text-gray-700 hover:text-green-700'}`}
              >
                {isPromoting ? 'Đang xử lý...' : 'Tăng bậc người dùng'}
              </button>

              <button
                onClick={handleDemote}
                disabled={selectedUser.role === 'Admin' || isDemoting}
                title={selectedUser.role === 'Admin' ? 'Quyền hạn quản trị viên không thể thay đổi' : ''}
                className={`p-2 rounded transition-colors ${selectedUser.role === 'Admin' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-red-200 text-gray-700 hover:text-red-700'}`}
              >
                {isDemoting ? 'Đang xử lý...' : 'Giảm bậc người dùng'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserList;