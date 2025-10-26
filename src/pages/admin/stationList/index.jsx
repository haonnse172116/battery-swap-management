import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { EllipsisHorizontalIcon, EyeIcon } from "@heroicons/react/24/outline";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/common/ConfirmModal';
import StationUpdateModal from '@/pages/admin/stationUpdateModal';
import { useGetStationsQuery, useUpdateStationMutation, useDeleteStationMutation } from '@/services/station.service';
import { useDebounce } from '@/hooks/useDebounce';

export default function StationList() {
    const token = useSelector(s => s.auth.accessToken);
    const [page] = useState(1);
    const [pageSize] = useState(10);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 400);
    const [statusFilter, setStatusFilter] = useState('');
    const [sortField, setSortField] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    const { data, isLoading, isError, refetch } = useGetStationsQuery({ page, pageSize, search });
    const [updateStation] = useUpdateStationMutation();
    const [deleteStation] = useDeleteStationMutation();

    const stations = data?.content || [];

    const [selected, setSelected] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);
    const [confirmState, setConfirmState] = useState({ open: false, action: null, payload: null });

    // menu state rendered via portal (so it doesn't affect table layout)
    const [menuState, setMenuState] = useState({ open: false, x: 0, y: 0, id: null });

    // map and routing refs so we can reuse / remove them
    const mapRef = useRef(null);
    const routingControlRef = useRef(null);

    // initialize base map (marker only) when modal opens
    useEffect(() => {
        if (showModal && selected) initMap(selected);
        return () => {
            if (!showModal) {
                if (routingControlRef.current && mapRef.current) {
                    try { mapRef.current.removeControl(routingControlRef.current); } catch (e) { }
                    routingControlRef.current = null;
                }
                if (mapRef.current) {
                    try { mapRef.current.remove(); } catch (e) { }
                    mapRef.current = null;
                }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showModal, selected]);

    const initMap = (station) => {
        // remove existing map if any (safe to call multiple times)
        if (mapRef.current) {
            try { mapRef.current.remove(); } catch (e) { }
            mapRef.current = null;
        }
        // create map
        mapRef.current = L.map("map", { zoomControl: true }).setView([station.latitude, station.longitude], 15);
        L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap contributors" }).addTo(mapRef.current);
        const icon = L.icon({ iconUrl: "https://unpkg.com/leaflet/dist/images/marker-icon.png", shadowUrl: "https://unpkg.com/leaflet/dist/images/marker-shadow.png", iconSize: [25, 41], iconAnchor: [12, 41] });
        L.marker([station.latitude, station.longitude], { icon }).addTo(mapRef.current).bindPopup(station.name).openPopup();
        setTimeout(() => { try { mapRef.current.invalidateSize(); } catch (e) { } }, 150);
    };

    const showRouteToStation = (station) => {
        if (!navigator.geolocation) { alert("Trình duyệt không hỗ trợ định vị"); return; }
        navigator.geolocation.getCurrentPosition((pos) => {
            const lat = pos.coords.latitude; const lon = pos.coords.longitude;
            if (!mapRef.current) initMap(station);
            if (routingControlRef.current && mapRef.current) { try { mapRef.current.removeControl(routingControlRef.current); } catch (e) { } routingControlRef.current = null; }
            mapRef.current.setView([lat, lon], 13);
            const icon = L.icon({ iconUrl: "https://unpkg.com/leaflet/dist/images/marker-icon.png", shadowUrl: "https://unpkg.com/leaflet/dist/images/marker-shadow.png", iconSize: [25, 41], iconAnchor: [12, 41] });
            L.marker([lat, lon], { icon }).addTo(mapRef.current).bindPopup("Vị trí của bạn").openPopup();
            L.marker([station.latitude, station.longitude], { icon }).addTo(mapRef.current).bindPopup(station.name);
            try {
                routingControlRef.current = L.Routing.control({ waypoints: [L.latLng(lat, lon), L.latLng(station.latitude, station.longitude)], lineOptions: { styles: [{ color: "#0a850f", weight: 4 }] }, addWaypoints: false, draggableWaypoints: false, fitSelectedRoutes: true, showAlternatives: false }).addTo(mapRef.current);
            } catch (e) { console.error(e); alert("Không thể tính đường đi (routing service lỗi)"); }
        }, (err) => { alert("Lỗi định vị: " + err.message); }, { enableHighAccuracy: true });
    };

    const onEllipsisClick = (e, s) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const width = 160; const left = Math.max(8, rect.right - width); const top = rect.bottom + window.scrollY + 6;
        setMenuState((prev) => { if (prev.open && prev.id === s.stationId) return { open: false, x: 0, y: 0, id: null }; return { open: true, x: left, y: top, id: s.stationId || s.id }; });
    };

    useEffect(() => { const onDocClick = () => setMenuState({ open: false, x: 0, y: 0, id: null }); document.addEventListener('click', onDocClick); return () => document.removeEventListener('click', onDocClick); }, []);

    return (
        <div className="p-6 min-h-screen">
            <h1 className="text-2xl font-semibold mb-4 text-gray-800">Danh sách trạm</h1>

            {/* Search / Filter / Sort controls */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm theo tên hoặc địa chỉ..." className="border rounded px-3 py-2 w-64" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded px-3 py-2">
                    <option value="">Tất cả trạng thái</option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Ngưng</option>
                </select>
                <select value={sortField} onChange={(e) => setSortField(e.target.value)} className="border rounded px-3 py-2">
                    <option value="name">Sắp xếp theo Tên</option>
                    <option value="address">Sắp xếp theo Địa chỉ</option>
                    <option value="createdAt">Sắp xếp theo Ngày tạo</option>
                </select>
                <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="px-3 py-2 border rounded">{sortOrder === 'asc' ? '↑ Tăng dần' : '↓ Giảm dần'}</button>
                <button onClick={() => refetch()} className="px-3 py-2 bg-blue-600 text-white rounded">Làm mới</button>
            </div>

            <div className="mt-4 rounded-lg shadow bg-white">
                <div className="overflow-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="p-3">Tên trạm</th>
                                <th className="p-3">Địa chỉ</th>
                                <th className="p-3">Trạng thái</th>
                                <th className="p-3">Ngày tạo</th>
                                <th className="p-3">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                // apply client-side search, filter and sort on the fetched list
                                stations
                                    .filter((x) => {
                                        if (!debouncedSearch) return true;
                                        const q = debouncedSearch.toLowerCase();
                                        return (x.name || '').toLowerCase().includes(q) || (x.address || '').toLowerCase().includes(q);
                                    })
                                    .filter((x) => {
                                        if (!statusFilter) return true;
                                        return statusFilter === 'active' ? !!x.isActive : !x.isActive;
                                    })
                                    .sort((a, b) => {
                                        const aVal = (a[sortField] ?? '')?.toString().toLowerCase();
                                        const bVal = (b[sortField] ?? '')?.toString().toLowerCase();
                                        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
                                        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
                                        return 0;
                                    })
                                    .map((s) => (
                                        <tr key={s.stationId || s.id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                                            <td className="p-3 font-medium text-gray-800">{s.name}</td>
                                            <td className="p-3 text-gray-600">{s.address}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                                                    {s.isActive ? "Hoạt động" : "Ngưng"}
                                                </span>
                                            </td>
                                            <td className="p-3 text-gray-600">{s.createdAt ? new Date(s.createdAt).toLocaleString() : '-'}</td>
                                            <td className="p-3 flex items-center gap-2">
                                                <button
                                                    onClick={() => { setSelected(s); setShowModal(true); setMenuState({ open: false, x: 0, y: 0, id: null }); }}
                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                    <span>Xem chi tiết</span>
                                                </button>

                                                <button onClick={(e) => onEllipsisClick(e, s)} className="p-1 rounded bg-gray-100 hover:bg-gray-200">
                                                    <EllipsisHorizontalIcon className="w-6 h-6 text-gray-500" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* portal menu rendered at body so it does not affect table layout/overflow */}
            {menuState.open && (
                ReactDOM.createPortal(
                    <div style={{ position: 'absolute', top: menuState.y, left: menuState.x, zIndex: 9999 }} className="w-40 bg-white border rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <button className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 text-gray-700" onClick={() => { const s = stations.find(x => (x.stationId || x.id) === menuState.id); setSelected(s); setConfirmState({ open: false, action: null, payload: null }); setShowUpdate(true); setMenuState({ open: false, x: 0, y: 0, id: null }); }}>
                            Cập nhật
                        </button>
                        <button className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 text-red-600" onClick={() => { const s = stations.find(x => (x.stationId || x.id) === menuState.id); setConfirmState({ open: true, action: 'delete', payload: s }); setMenuState({ open: false, x: 0, y: 0, id: null }); }}>
                            Xóa trạm
                        </button>
                    </div>, document.body
                )
            )}

            {/* Confirm Modal for update/delete */}
            <ConfirmModal
                open={confirmState.open}
                title={confirmState.action === 'delete' ? 'Xác nhận xóa' : 'Xác nhận cập nhật'}
                onCancel={() => setConfirmState({ open: false, action: null, payload: null })}
                onConfirm={async () => {
                    const s = confirmState.payload;
                    if (!s) return setConfirmState({ open: false, action: null, payload: null });
                    try {
                        if (confirmState.action === 'update') {
                            await updateStation({ id: s.stationId || s.id, station: { name: s.name, address: s.address, latitude: s.latitude, longitude: s.longitude, isActive: !!s.isActive } }).unwrap();
                            toast.success('Cập nhật trạm thành công');
                        } else if (confirmState.action === 'delete') {
                            await deleteStation({ id: s.stationId || s.id }).unwrap();
                            toast.success('Xóa trạm thành công');
                        }
                        refetch();
                    } catch (err) {
                        toast.error(err?.data?.message || (confirmState.action === 'delete' ? 'Xóa trạm thất bại' : 'Cập nhật trạm thất bại'));
                    }
                    setConfirmState({ open: false, action: null, payload: null });
                }}
                confirmText={confirmState.action === 'delete' ? 'Xóa' : 'Đồng ý'}
                cancelText="Hủy"
            >
                {confirmState.action === 'delete' ? (
                    <p>Bạn có chắc muốn xóa trạm <strong>{confirmState.payload?.name}</strong>?</p>
                ) : (
                    <p>Bạn có muốn thay đổi trạng thái hoạt động của trạm <strong>{confirmState.payload?.name}</strong>?</p>
                )}
            </ConfirmModal>

            {/* Update modal flow: open form, then confirm before calling update */}
            <StationUpdateModal
                open={showUpdate}
                station={selected}
                onClose={() => { setShowUpdate(false); setSelected(null); }}
                onSave={(payload) => {
                    // payload is the updated station data; open confirm modal to finalize
                    setShowUpdate(false);
                    setConfirmState({ open: true, action: 'update', payload });
                }}
            />

            {/* Modal - details with map */}
            {showModal && selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative">
                        <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-xl">
                            <h2 className="text-lg font-semibold text-gray-800">Chi tiết trạm</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-800">✕</button>
                        </div>
                        <div className="p-5 space-y-3 overflow-y-auto flex-1 min-h-0">
                            <p><strong>Tên:</strong> {selected.name}</p>
                            <p><strong>Địa chỉ:</strong> {selected.address}</p>
                            <p><strong>Trạng thái:</strong> {selected.isActive ? 'Hoạt động' : 'Ngưng'}</p>
                            <p><strong>Ngày tạo:</strong> {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : '-'}</p>
                            <p><strong>Cập nhật:</strong> {selected.updatedAt ? new Date(selected.updatedAt).toLocaleString() : '-'}</p>
                            <div className="border rounded-lg overflow-hidden mt-4"><div id="map" className="h-96 w-full"></div></div>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => showRouteToStation(selected)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Hiển thị đường đi</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
