import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useGetStationsQuery } from '@/services/station.service';
import { useGetUsersQuery } from '@/services/userManagement.service';
import {
  useGetStationStaffByStationQuery,
  useAssignStationStaffMutation,
  useDeleteStationStaffMutation,
} from '@/services/stationStaff.service';
import { useDebounce } from '@/hooks/useDebounce';

export default function UserStationStaff() {
  const [stationId, setStationId] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // stations for dropdown
  const { data: stationsData, isLoading: loadingStations } = useGetStationsQuery({ page: 1, pageSize: 200 });
  const stations = stationsData?.content || [];

  // users (filter role = 'Staff' on API)
  const { data: usersData, isLoading: loadingUsers, refetch: refetchUsers } = useGetUsersQuery({
    page: 1,
    pageSize: 200,
    search: debouncedSearch,
    role: 'Staff',
  });
  const users = usersData?.content || [];

  // station staff (assigned to selected station)
  const {
    data: stationStaffData,
    isLoading: loadingStationStaff,
    refetch: refetchStationStaff,
  } = useGetStationStaffByStationQuery(
    stationId ? { stationId, page: 1, pageSize: 500, search: '' } : null,
    { skip: !stationId }
  );
  const stationStaff = stationStaffData?.content || [];

  // mutations
  const [assignStationStaff, { isLoading: assigning }] = useAssignStationStaffMutation();
  const [deleteStationStaff, { isLoading: deleting }] = useDeleteStationStaffMutation();

  // confirm modal for deletion
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null); // { stationStaffId, staffName }

  // compute assigned userIds for the selected station (to filter left list)
  const assignedUserIds = useMemo(() => new Set((stationStaff || []).map((s) => String(s.userId))), [stationStaff]);

  // left: unassigned staff relative to selected station
  const unassignedStaff = useMemo(() => {
    if (!users) return [];
    // user object shape may vary: try common keys id / userId
    return users.filter((u) => {
      const uid = String(u.userId ?? u.id ?? '');
      // if station not chosen, show all staff (still allow searching)
      if (!stationId) return (
        !debouncedSearch ? true :
        (String(u.fullName || u.staffName || u.name || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
         String(u.email || u.userEmail || '').toLowerCase().includes(debouncedSearch.toLowerCase()))
      );
      // if station chosen, exclude already assigned
      return !assignedUserIds.has(uid);
    });
  }, [users, stationId, assignedUserIds, debouncedSearch]);

  // Avatar component (shared)
  function Avatar({ name, url, size = 12 }) {
    const w = size === 16 ? 'w-16 h-16' : size === 14 ? 'w-14 h-14' : 'w-12 h-12';
    if (url) {
      return (
        <img src={url} alt={name || 'Avatar'} className={`${w} rounded-full object-cover`} />
      );
    }
    const initials = name
      ? name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()
      : 'U';
    return (
      <div className={`${w} rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700`}>
        {initials}
      </div>
    );
  }

  // handlers
  const handleAssign = async (user) => {
    if (!stationId) return toast.error('Vui lòng chọn trạm trước khi gán nhân viên.');
    const userId = String(user.userId ?? user.id ?? '');
    if (!userId) return toast.error('Không tìm thấy userId của người dùng.');

    // validate already assigned (shouldn't happen because filtered above, but double-check)
    if (assignedUserIds.has(userId)) return toast.error('Nhân viên đã được phân công ở trạm này.');

    try {
      await toast.promise(
        assignStationStaff({ stationId: String(stationId), userId }).unwrap(),
        {
          loading: `Đang gán nhân viên ${user.fullName || user.staffName || user.name}...`,
          success: 'Gán nhân viên thành công',
          error: (err) => err?.data?.message || 'Gán thất bại',
        }
      );
      // refresh lists
      refetchStationStaff && refetchStationStaff();
      refetchUsers && refetchUsers();
    } catch (err) {
      // toast.promise handled message
    }
  };

  const handleDeleteClick = (item) => {
    setConfirmTarget({ stationStaffId: item.stationStaffId || item.id, staffName: item.staffName || item.staffName || item.userName || '' });
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmTarget?.stationStaffId) {
      toast.error('Không tìm thấy mục để xóa.');
      setConfirmOpen(false);
      return;
    }
    const id = confirmTarget.stationStaffId;
    setConfirmOpen(false);
    try {
      await toast.promise(deleteStationStaff({ stationStaffId: id }).unwrap(), {
        loading: 'Đang xóa phân công...',
        success: 'Xóa phân công thành công',
        error: (err) => err?.data?.message || 'Xóa thất bại',
      });
      refetchStationStaff && refetchStationStaff();
      refetchUsers && refetchUsers();
    } catch (err) {
      // handled by toast
    } finally {
      setConfirmTarget(null);
    }
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Phân công nhân viên cho trạm</h1>
      </div>

      {/* equal two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: staff list (unassigned relative to selected station) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-medium text-gray-800">Danh sách nhân viên</h2>
              <div className="text-sm text-gray-500">Hiện những nhân viên chưa được phân cho trạm đang chọn</div>
            </div>

            <input
              placeholder="Tìm tên / email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-56"
            />
          </div>

          <div className="space-y-3">
            {loadingUsers ? (
              <div className="p-4 text-center">Đang tải danh sách nhân viên...</div>
            ) : unassignedStaff.length === 0 ? (
              <div className="p-4 text-center text-gray-400 bg-white rounded shadow">Không tìm thấy nhân viên chưa phân công</div>
            ) : (
              unassignedStaff.map((u) => {
                const uid = String(u.userId ?? u.id ?? '');
                const displayName = u.fullName || u.staffName || u.name || '—';
                const displayEmail = u.email || u.userEmail || '—';
                const avatarUrl = u.avatarUrl || u.avatar || u.userAvatar || '';

                return (
                  <div
                    key={uid || `${displayName}-${Math.random()}`}
                    className="bg-white rounded-lg shadow-sm p-3 flex items-center justify-between border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={displayName} url={avatarUrl} />
                      <div>
                        <div className="font-medium text-gray-800">{displayName}</div>
                        <div className="text-xs text-gray-500">{displayEmail}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        disabled={!stationId || assigning}
                        onClick={() => handleAssign(u)}
                        className={`px-3 py-1 rounded text-sm ${!stationId ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                      >
                        Gán
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: assigned staff for selected station */}
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium text-gray-800">Nhân viên ở trạm</h2>
              <div className="text-sm text-gray-500">Chọn trạm để xem nhân viên đã được phân công</div>
            </div>

            <select
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="">-- Chọn trạm --</option>
              {stations.map((st) => (
                <option key={st.stationId || st.id} value={st.stationId || st.id}>
                  {st.name || st.stationName || `${st.address || ''}`}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {loadingStationStaff ? (
              <div className="p-4 text-center">Đang tải nhân viên trạm...</div>
            ) : stationStaff.length === 0 ? (
              <div className="p-4 text-center text-gray-400 bg-white rounded shadow">Trạm chưa có nhân viên</div>
            ) : (
              stationStaff.map((s) => {
                const sid = s.stationStaffId || s.id || `${s.userId}-${s.stationId}`;
                const name = s.staffName || s.userName || s.fullName || '—';
                const email = s.staffEmail || s.userEmail || s.email || '';
                const avatarUrl = s.avatarUrl || s.staffAvatar || s.userAvatar || s.avatar || '';

                return (
                  <div key={sid} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={name} url={avatarUrl} size={14} />
                      <div>
                        <div className="font-medium text-gray-800">{name}</div>
                        <div className="text-xs text-gray-500">{email}</div>
                        <div className="text-xs text-gray-400 mt-1">Gán lúc: {s.assignedAt ? new Date(s.assignedAt).toLocaleString() : (s.assigned_at || '—')}</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => handleDeleteClick(s)}
                        className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Bỏ phân công
                      </button>
                      <div className="text-xs text-gray-500">ID: {sid}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Xác nhận xóa phân công"
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setConfirmOpen(false); setConfirmTarget(null); }}
        confirmText="Bỏ phân công"
        cancelText="Hủy"
        isLoading={deleting}
      >
        <div className="text-sm text-gray-700">
          Bạn có chắc muốn bỏ phân công nhân viên <strong>{confirmTarget?.staffName}</strong> khỏi trạm không?
        </div>
      </ConfirmModal>
    </div>
  );
}
