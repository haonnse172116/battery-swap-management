import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useDebounce } from '@/hooks/useDebounce';
import { useGetAllBatteriesQuery, useUpdateBatteryMutation, useDeleteBatteryMutation } from '@/services/battery.service';
import { useGetStationsQuery } from '@/services/station.service';
import BatteryUpdateModal from '@/pages/admin/batteryUpdateModal';
import ReactDOM from 'react-dom';

const statusColor = {
    Available: 'bg-green-100 text-green-700',
    InUse: 'bg-yellow-100 text-yellow-700',
    Charging: 'bg-blue-100 text-blue-700',
    Damaged: 'bg-red-100 text-red-700',
    Maintenance: 'bg-gray-100 text-gray-700',
    QualityCheck: 'bg-indigo-100 text-indigo-700',
};

function ImageWithFallback({ src, alt, className }) {
    const fallback = 'https://b2232832.smushcdn.com/2232832/wp-content/uploads/2023/04/EV-urban-myth_01.jpg?lossy=1&strip=0&webp=1';
    return <img src={src || fallback} alt={alt} className={className} onError={(e) => { e.currentTarget.src = fallback; }} />;
}

export default function AdminBatteryList() {
    const [page, setPage] = useState(1);
    const [pageSize] = useState(12);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);
    const [statusFilter, setStatusFilter] = useState('');
    const [sortField, setSortField] = useState('serialNo');
    const [sortOrder, setSortOrder] = useState('asc');

    // fetch a large page from server and paginate client-side to avoid server-side pagination mismatches
    const SERVER_FETCH_SIZE = 10000; // fetch all (or many) and paginate client-side
    const { data: batteriesData, isLoading, refetch } = useGetAllBatteriesQuery({ page: 1, pageSize: SERVER_FETCH_SIZE, search: debouncedSearch });
    const allBatteries = batteriesData?.content || [];

    // client-side paging: pageSize controls how many items per page we display
    const batteries = allBatteries;
    const totalPages = Math.max(1, Math.ceil((batteries.length || 0) / pageSize));

    const { data: stationsData } = useGetStationsQuery({ page: 1, pageSize: 100000 });
    const stations = stationsData?.content || [];

    const [updateBattery] = useUpdateBatteryMutation();
    const [deleteBattery] = useDeleteBatteryMutation();

    const [editing, setEditing] = useState(null);
    const [confirmState, setConfirmState] = useState({ open: false, action: null, payload: null });
    const [detailBattery, setDetailBattery] = useState(null);
    const [menuState, setMenuState] = useState({ open: false, x: 0, y: 0, id: null });

    const filteredSorted = useMemo(() => {
        let list = [...batteries];
        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            list = list.filter(b => (b.serialNo?.toString() || '').toLowerCase().includes(q) || (b.batteryId || '').toLowerCase().includes(q) || (b.batteryTypeName || '').toLowerCase().includes(q) || (b.stationName || '').toLowerCase().includes(q));
        }
        if (statusFilter) list = list.filter(b => b.status === statusFilter);
        list.sort((a, b) => {
            const aVal = (a[sortField] ?? '')?.toString().toLowerCase();
            const bVal = (b[sortField] ?? '')?.toString().toLowerCase();
            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        return list;
    }, [batteries, debouncedSearch, statusFilter, sortField, sortOrder]);

    // visible page items
    const pagedItems = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredSorted.slice(start, start + pageSize);
    }, [filteredSorted, page, pageSize]);

    // const handleUpdateConfirmed = async (payload) => {
    //     try {
    //         toast.promise(updateBattery({ battery: payload }).unwrap(), {
    //             loading: 'Đang cập nhật...',
    //             success: 'Cập nhật pin thành công',
    //             error: (err) => err?.data?.message || 'Cập nhật thất bại',
    //         });
    //         setConfirmState({ open: false, action: null, payload: null });
    //         setEditing(null);
    //         await refetch();
    //     } catch (e) {
    //         // handled by toast.promise
    //     }
    // };

    // const handleDeleteConfirmed = async (id) => {
    //     try {
    //         toast.promise(deleteBattery({ id }).unwrap(), {
    //             loading: 'Đang xóa...',
    //             success: 'Xóa pin thành công',
    //             error: (err) => err?.data?.message || 'Xóa thất bại',
    //         });
    //         setConfirmState({ open: false, action: null, payload: null });
    //         await refetch();
    //     } catch (e) { }
    // };

    return (
        <div className="p-6 min-h-screen">
            <h1 className="text-2xl font-semibold mb-4 text-gray-800">Quản lý pin (Admin)</h1>

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm theo serial, id, loại, trạm..." className="border rounded px-3 py-2 w-64" />
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="border rounded px-3 py-2">
                    <option value="">Tất cả trạng thái</option>
                    <option value="Available">Available</option>
                    <option value="InUse">InUse</option>
                    <option value="Charging">Charging</option>
                    <option value="Damaged">Damaged</option>
                </select>
                <select value={sortField} onChange={e => setSortField(e.target.value)} className="border rounded px-3 py-2">
                    <option value="serialNo">Số series</option>
                    <option value="owner">Chủ sở hữu</option>
                    <option value="status">Trạng thái</option>
                    <option value="batteryTypeId">Loại pin</option>
                    <option value="capacityWh">Dung tích (Wh)</option>
                </select>
                <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="px-3 py-2 border rounded">{sortOrder === 'asc' ? '↑ Tăng dần' : '↓ Giảm dần'}</button>
                <button onClick={() => refetch()} className="px-3 py-2 bg-blue-600 text-white rounded">Làm mới</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <div className="p-6">Đang tải...</div>
                ) : filteredSorted.length === 0 ? (
                    <div className="p-6 bg-white rounded">Không có pin</div>
                ) : (
                    pagedItems.map(b => (
                        <div key={b.batteryId || b.batteryId} className="bg-white rounded-lg shadow p-4 border border-gray-200 flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-sm text-gray-500">Serial No.</div>
                                    <div className="font-semibold text-gray-800">{b.serialNo}</div>
                                </div>
                                <div>
                                    <div className={`text-xs font-semibold px-2 py-1 rounded ${statusColor[b.status] || 'bg-gray-100 text-gray-700'}`}>{b.status}</div>
                                </div>
                            </div>

                            <div className="text-xs text-gray-500">ID: {b.batteryId}</div>
                            <div className="text-xs text-gray-500">Loại: {b.batteryTypeName || b.batteryTypeId}</div>
                            <div className="text-xs text-gray-500">Trạm: {b.stationName ? b.stationName : "Không có trạm"}</div>
                            <div className="text-xs text-gray-500">Điện áp: {b.voltage} | Dung lượng: {b.capacityWh} Wh</div>

                            <div className="mt-3 grid grid-cols-[5fr_1fr] gap-2">
                                <button onClick={() => setDetailBattery(b)} className="px-3 py-2 bg-gray-100 rounded text-sm hover:bg-gray-200">Xem chi tiết</button>
                                <button onClick={(e) => {
                                    e.stopPropagation();
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setMenuState(prev => ({ open: prev.open && prev.id === b.batteryId ? false : true, x: rect.left, y: rect.bottom + window.scrollY + 6, id: b.batteryId }));
                                }} className="px-3 py-2 bg-white border rounded text-sm">...</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* portal menu for per-item actions */}
            {menuState.open && (
                ReactDOM.createPortal(
                    <div style={{ position: 'absolute', top: menuState.y, left: menuState.x, zIndex: 9999 }} className="w-37 bg-white border rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <button className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 text-gray-700" onClick={() => {
                            const b = filteredSorted.find(x => x.batteryId === menuState.id);
                            setEditing(b);
                            setMenuState({ open: false, x: 0, y: 0, id: null });
                        }}>Cập nhật</button>
                        <button className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 text-red-600" onClick={() => {
                            const b = filteredSorted.find(x => x.batteryId === menuState.id);
                            setConfirmState({ open: true, action: 'delete', payload: b });
                            setMenuState({ open: false, x: 0, y: 0, id: null });
                        }}>Xóa pin</button>
                    </div>, document.body
                )
            )}

            {/* battery detail modal */}
            {detailBattery && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
                    {/* Overlay để đóng modal */}
                    <div className="absolute inset-0" onClick={() => setDetailBattery(null)} />

                    {/* Modal chính */}
                    <div className="relative z-10 w-[min(95%,850px)] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-fadeIn">
                        {/* Header */}
                        <div className="p-5 border-b bg-gradient-to-r from-blue-50 to-blue-100 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                🔋 Chi tiết pin
                            </h3>
                            <button
                                onClick={() => setDetailBattery(null)}
                                className="text-gray-500 hover:text-red-500 text-xl leading-none"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Nội dung */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Hình ảnh */}
                            <div className="md:col-span-1 flex flex-col items-center">
                                <div className="relative group">
                                    <ImageWithFallback
                                        src={detailBattery.imageUrl || detailBattery.imageURL}
                                        alt={`Battery ${detailBattery.batteryId}`}
                                        className="w-full h-56 object-cover rounded-md shadow-md transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 rounded-lg bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                {/* Badge trạng thái */}
                                <div className="mt-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${detailBattery.status === 'Available'
                                                ? 'bg-green-100 text-green-700'
                                                : detailBattery.status === 'In Use'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        {detailBattery.status || 'Unknown'}
                                    </span>
                                </div>
                            </div>

                            {/* Thông tin chi tiết */}
                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                {[
                                    ['Battery ID', detailBattery.batteryId],
                                    ['Serial No', detailBattery.serialNo],
                                    ['Owner', detailBattery.owner],
                                    ['Voltage', detailBattery.voltage],
                                    ['Capacity (Wh)', detailBattery.capacityWh],
                                    ['Current Capacity (Wh)', detailBattery.currentCapacityWh ?? '-'],
                                    ['Station', detailBattery.stationName || detailBattery.stationId || '-'],
                                    ['Battery Type', detailBattery.batteryTypeName || detailBattery.batteryTypeId],
                                    ['Reservation', detailBattery.reservationId || '-'],
                                    ['Created', detailBattery.createdAt ? new Date(detailBattery.createdAt).toLocaleString() : '-'],
                                    ['Updated', detailBattery.updatedAt ? new Date(detailBattery.updatedAt).toLocaleString() : '-'],
                                ].map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="flex flex-col border border-gray-100 rounded-md p-2 bg-gray-50/40 hover:bg-gray-100/60 transition"
                                    >
                                        <span className="text-gray-500 text-xs">{label}</span>
                                        <span className="font-medium text-gray-800 break-words">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* pagination */}
            <div className="flex items-center gap-2 justify-center py-4">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border rounded disabled:opacity-50">Trước</button>
                <div className="px-3 py-1">{page} / {totalPages}</div>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Sau</button>
            </div>

            {/* edit modal -> opens confirm on save */}
            <BatteryUpdateModal open={!!editing} battery={editing} stations={stations} onClose={() => setEditing(null)} onSave={(payload) => setConfirmState({ open: true, action: 'update', payload })} />

            <ConfirmModal
                open={confirmState.open}
                title={confirmState.action === 'delete' ? 'Xác nhận xóa pin' : 'Xác nhận cập nhật pin'}
                onCancel={() => setConfirmState({ open: false, action: null, payload: null })}
                onConfirm={async () => {
                    if (!confirmState.payload) return setConfirmState({ open: false, action: null, payload: null });
                    try {
                        if (confirmState.action === 'update') {
                            await updateBattery({ battery: confirmState.payload }).unwrap();
                            toast.success('Cập nhật pin thành công');
                        } else if (confirmState.action === 'delete') {
                            await deleteBattery({ id: confirmState.payload.batteryId }).unwrap();
                            toast.success('Xóa pin thành công');
                        }
                        refetch();
                    } catch (err) {
                        toast.error(err?.data?.message || (confirmState.action === 'delete' ? 'Xóa pin thất bại' : 'Cập nhật pin thất bại'));
                    }
                    setConfirmState({ open: false, action: null, payload: null });
                    setEditing(null);
                }}
                confirmText={confirmState.action === 'delete' ? 'Xóa' : 'Đồng ý'}
                cancelText="Hủy"
            >
                {confirmState.action === 'delete' ? (
                    <p>Bạn có chắc muốn xóa pin <strong>{confirmState.payload?.batteryId}</strong>?</p>
                ) : (
                    <p>Bạn có muốn lưu thay đổi cho pin <strong>{confirmState.payload?.batteryId}</strong>?</p>
                )}
            </ConfirmModal>
        </div>
    );
}