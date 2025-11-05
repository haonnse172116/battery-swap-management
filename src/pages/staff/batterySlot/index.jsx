import ConfirmModal from '../../../components/common/ConfirmModal';
import { useDebounce } from '@/hooks/useDebounce';
import { useGetBatteriesByStationQuery } from '@/services/battery.service';
import { useGetStationsQuery } from '@/services/station.service';
import { useDeleteSlotMutation, useGetStationSlotsQuery, useRegisterSlotMutation, useUpdateSlotMutation } from '@/services/stationBatterySlot.service';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

/**
 * BatterySlotManager
 * - Step 1: show station cards (grid). click a card => open station view
 * - Step 2: when a station is selected: show breadcrumb + two-column slot manager
 */

const statusColor = {
    Available: 'bg-green-100 text-green-700',
    InUse: 'bg-yellow-100 text-yellow-700',
    Charging: 'bg-blue-100 text-blue-700',
    Damaged: 'bg-red-100 text-red-700',
    Maintenance: 'bg-gray-100 text-gray-700',
    QualityCheck: 'bg-indigo-100 text-indigo-700',
};

export default function BatterySlotManager() {
    // Station list & selection
    const [viewStationId, setViewStationId] = useState('');
    const [pageStations] = useState(1);
    const [pageSizeStations] = useState(12);

    // filters for batteries inside station view
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);
    const [statusFilter, setStatusFilter] = useState('');
    const [sortField, setSortField] = useState('serialNo');
    const [sortOrder, setSortOrder] = useState('asc');

    // fetch stations (for cards)
    const { data: stationsData, isLoading: loadingStations } = useGetStationsQuery({ page: pageStations, pageSize: pageSizeStations });
    const stations = stationsData?.content || [];

    // batteries assigned to station (for left column)
    const { data: batteriesData, isLoading: loadingBatteries, refetch: refetchBatteries } = useGetBatteriesByStationQuery(
        { stationId: viewStationId, page: 1, pageSize: 1000, search: debouncedSearch },
        { skip: !viewStationId }
    );
    const assignedBatteries = batteriesData?.content || [];

    // slots for station (right column)
    const { data: slotsData, refetch: refetchSlots } = useGetStationSlotsQuery(viewStationId, { skip: !viewStationId });
    const slots = [...(slotsData?.content || [])].sort((a, b) => a.slotNo - b.slotNo);

    // console.log(slots)

    // confirm modal state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    // register / update / delete slot hooks
    const [registerSlot, { isLoading: _registering }] = useRegisterSlotMutation();
    const [deleteSlot] = useDeleteSlotMutation();
    const [updateSlot] = useUpdateSlotMutation();
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        // when change station, reset helper state
        setRegistering(false);
    }, [viewStationId]);

    // filtered/sorted list of assigned batteries (exclude those already pending)
    const filteredAssigned = useMemo(() => {
        let list = (assignedBatteries || []).slice();
        if (statusFilter) list = list.filter(b => b.status === statusFilter);
        if (debouncedSearch) list = list.filter(b => String(b.serialNo || b.id || b.batteryId).toLowerCase().includes(debouncedSearch.toLowerCase()));
        list.sort((a, b) => {
            const A = String(a[sortField] || '').toLowerCase();
            const B = String(b[sortField] || '').toLowerCase();
            if (A < B) return sortOrder === 'asc' ? -1 : 1;
            if (A > B) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        return list;
    }, [assignedBatteries, statusFilter, debouncedSearch, sortField, sortOrder]);

    // determine next slot numbers for pending adds: fill gaps starting from 1
    // determine next available slot number (fill gaps starting from 1)
    const getNextAvailableSlotNo = () => {
        const used = new Set((slots || []).map(s => Number(s.slotNo)).filter(n => !isNaN(n)));
        let n = 1;
        while (used.has(n)) n++;
        return n;
    };

    // Immediately create slot for a battery when pressing the create button on its card
    // tạo slot ngay cho 1 battery (single)
    const handleCreateSlotForBattery = async (battery) => {
        const id = String(battery.id || battery.batteryId);
        const existsInSlots = (slots || []).some(s => String(s.batteryId) === id);
        if (existsInSlots) return toast.error('Pin đã có slot trong trạm');
        const slotNo = getNextAvailableSlotNo();

        const slotData = {
            stationSlotId: '',
            stationId: String(viewStationId),
            batteryId: id,
            slotNo: Number(slotNo),
            status: 'Available'
        };

        setRegistering(true);
        try {
            await toast.promise(registerSlot(slotData).unwrap(), {
                loading: `Đang tạo slot ${slotNo} cho ${id}`,
                success: `Tạo slot ${slotNo} thành công`,
                error: (e) => e?.data?.message || 'Tạo slot thất bại',
            });
            await refetchSlots();
            await refetchBatteries();
        } catch (err) {
            // handled by toast.promise
        } finally {
            setRegistering(false);
        }
    };

    // removed bulk/pending logic: we create/update/delete individual slots only

    // UI helpers
    const openStation = (id) => {
        setViewStationId(String(id));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const backToStations = () => {
        setViewStationId('');
        setSearch('');
        setStatusFilter('');
    };

    // --- Render ---
    return (
        <div className="p-6 min-h-screen">
            {/* Breadcrumb or title */}
            <div className="mb-6">
                {!viewStationId ? (
                    <h1 className="text-2xl font-semibold text-gray-800">Quản lý slot & danh sách trạm</h1>
                ) : (
                    <nav className="text-lg text-gray-600" aria-label="Breadcrumb">
                        <ol className="list-reset flex items-center gap-2">
                            <li>
                                <button onClick={backToStations} className="text-blue-600 hover:underline">Danh sách trạm</button>
                            </li>
                            <li className="text-gray-400">/</li>
                            <li className="font-semibold text-gray-800">{stations.find(s => String(s.stationId || s.id) === String(viewStationId))?.name || 'Trạm'}</li>
                        </ol>
                    </nav>
                )}
            </div>

            {/* Station cards view */}
            {!viewStationId && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {loadingStations ? (
                        <div>Đang tải trạm...</div>
                    ) : stations.length === 0 ? (
                        <div className="text-gray-500">Không có trạm</div>
                    ) : (
                        stations.map(st => (
                            <div key={st.stationId || st.id} className="relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="absolute right-3 top-3">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${st.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {st.isActive ? 'Hoạt động' : 'Ngưng'}
                                    </span>
                                </div>

                                <div className="p-5">
                                    <div className="mb-1">
                                        <h2 className="text-lg font-bold text-gray-800">{st.name || st.stationName}</h2>
                                        <div className="text-sm text-gray-500 mt-1">{st.address}</div>
                                    </div>

                                    {/* simple counts can be added if you want by querying batteries; omitted to keep it light */}
                                    <div className="mt-6">
                                        <button onClick={() => openStation(st.stationId || st.id)} className="block mx-auto w-3/4 text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                                            Quản lý slot trạm
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Station slot manager (two-column) */}
            {viewStationId && (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">{stations.find(s => String(s.stationId || s.id) === String(viewStationId))?.name || 'Trạm'}</h3>
                                <div className="text-sm text-gray-500">{stations.find(s => String(s.stationId || s.id) === String(viewStationId))?.address || ''}</div>
                            </div>
                            <div>
                                <button onClick={backToStations} className="text-sm text-gray-600 underline">Quay lại danh sách trạm</button>
                            </div>
                        </div>
                    </div>

                    {/* filters + action */}
                    <div className="flex flex-wrap items-center gap-3">
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm serial, id..." className="border rounded px-3 py-2 w-64" />
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded px-3 py-2">
                            <option value="">Tất cả trạng thái</option>
                            <option value="Available">Available</option>
                            <option value="InUse">InUse</option>
                            <option value="Charging">Charging</option>
                            <option value="Damaged">Damaged</option>
                        </select>
                        <select value={sortField} onChange={e => setSortField(e.target.value)} className="border rounded px-3 py-2">
                            <option value="serialNo">Số series</option>
                            <option value="batteryTypeName">Loại</option>
                        </select>
                        <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="px-3 py-2 border rounded">{sortOrder === 'asc' ? '↑ Tăng dần' : '↓ Giảm dần'}</button>
                        <button onClick={() => { refetchBatteries && refetchBatteries(); refetchSlots && refetchSlots(); }} className="px-3 py-2 bg-blue-600 text-white rounded">Làm mới</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left: assigned batteries */}
                        <div>
                            <div className="text-sm text-gray-600 mb-2">Pin đã điều phối vào trạm</div>
                            <div className="space-y-2 h-[60vh] overflow-auto p-2 bg-gray-50 rounded">
                                {loadingBatteries ? (
                                    <div>Đang tải...</div>
                                ) : filteredAssigned.length === 0 ? (
                                    <div className="text-center text-gray-500 py-6">Không có pin</div>
                                ) : (
                                    filteredAssigned.map(b => {
                                        const hasSlot = (slots || []).some(s => String(s.batteryId) === String(b.id || b.batteryId || b.serialNo));
                                        return (
                                            <div key={b.id || b.batteryId || b.serialNo} className="flex items-center justify-between p-3 bg-white border rounded">
                                                <div>
                                                    <div className="font-medium">Id: {b.id || b.batteryId}</div>
                                                    <div className="text-sm text-gray-500">Serial No: {b.serialNo}</div>
                                                    <div className="text-sm text-gray-500">Loại: {b.batteryTypeName || b.type}</div>
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <div className={`text-xs font-semibold px-2 py-1 rounded ${statusColor[b.status] || 'bg-gray-100 text-gray-700'}`}>{b.status}</div>
                                                    <button disabled={hasSlot} className={`px-3 py-1 ${hasSlot ? 'bg-gray-300 text-gray-600' : 'bg-green-600 text-white'} rounded`} onClick={() => handleCreateSlotForBattery(b)}>{hasSlot ? 'Đã có slot' : 'Tạo slot'}</button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Right: slots and pending adds */}
                        <div>
                            <div className="text-sm text-gray-600 mb-2">Danh sách slot của trạm</div>
                            <div className="space-y-2 p-2 bg-white border rounded h-[60vh] overflow-auto">
                                {/* existing slots sorted */}
                                {(slots || []).map(s => {
                                    const battery = assignedBatteries.find(b => String(b.id || b.batteryId || b.serialNo) === String(s.batteryId));
                                    return (
                                        <div
                                            key={s.id || `${s.stationId}-${s.slotNo}`}
                                            className="flex justify-between items-start p-3 border rounded bg-white hover:shadow-sm transition"
                                        >
                                            {/* Left info */}
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <div className="font-medium">Slot {s.slotNo}</div>
                                                    <span
                                                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${s.status === 'Available'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-yellow-100 text-red-700'
                                                            }`}
                                                    >
                                                        {s.status === 'Available' ? 'Available' : 'Full_slot'}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">Mã pin: {s.batteryId || '—'}</div>
                                                <div className="text-sm text-gray-500">Serial No: {battery?.serialNo || '—'}</div>
                                                <div className="text-sm text-gray-500">Loại: {battery?.batteryTypeName || battery?.type || '—'}</div>
                                            </div>

                                            {/* Right buttons */}
                                            <div className="flex flex-col gap-2 items-end">
                                                <button
                                                    className="px-2.5 py-1 text-xs bg-yellow-500 text-white rounded hover:opacity-90 transition"
                                                    onClick={async () => {
                                                        try {
                                                            const newStatus =
                                                                s.status === 'Available'
                                                                    ? 'Full_slot'
                                                                    : s.status === 'Full_slot'
                                                                        ? 'Available'
                                                                        : 'Available';

                                                            const slotData = {
                                                                stationSlotId: s.stationSlotId || s.id || '',
                                                                stationId: s.stationId,
                                                                batteryId: s.batteryId,
                                                                slotNo: Number(s.slotNo),
                                                                status: newStatus,
                                                            };

                                                            await toast.promise(updateSlot(slotData).unwrap(), {
                                                                loading: 'Đang cập nhật...',
                                                                success: 'Cập nhật slot thành công',
                                                                error: (e) => e?.data?.message || 'Cập nhật thất bại',
                                                            });

                                                            await refetchSlots();
                                                        } catch (err) { }
                                                    }}
                                                >
                                                    Thay đổi trạng thái
                                                </button>

                                                <button
                                                    className="px-2.5 py-1 text-xs bg-red-500 text-white rounded hover:opacity-90 transition"
                                                    onClick={() => {
                                                        setSelectedSlot(s);
                                                        setConfirmOpen(true);
                                                    }}
                                                >
                                                    Xóa slot
                                                </button>
                                            </div>
                                            {/* Confirm action before delete */}
                                            <ConfirmModal
                                                open={confirmOpen}
                                                title="Xác nhận xóa slot"
                                                onCancel={() => {
                                                    setConfirmOpen(false);
                                                    setSelectedSlot(null);
                                                }}
                                                onConfirm={async () => {
                                                    if (!selectedSlot) return;
                                                    try {
                                                        await toast.promise(deleteSlot(selectedSlot.stationSlotId).unwrap(), {
                                                            loading: 'Đang xóa...',
                                                            success: 'Xóa slot thành công',
                                                            error: (e) => e?.data?.message || 'Xóa thất bại',
                                                        });
                                                        await refetchSlots();
                                                        await refetchBatteries();
                                                    } catch (err) { }
                                                    setConfirmOpen(false);
                                                    setSelectedSlot(null);
                                                }}
                                                confirmText="Xóa"
                                                cancelText="Hủy"
                                                confirmClassName="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800"
                                            >
                                                <p>
                                                    Bạn có chắc muốn xóa id pin <strong>{selectedSlot?.batteryId}</strong> ở  <span className="font-bold text-red-600">slot {selectedSlot?.slotNo}</span> không?<br />
                                                </p>
                                            </ConfirmModal>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
