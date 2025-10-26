import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { EllipsisHorizontalIcon, EyeIcon } from "@heroicons/react/24/outline";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// StationList component with fixes:
// - Reuse / remove map instance properly so routing works
// - Use a portal for the action menu so it doesn't affect table layout / scroll
// - Remove bottom border for last row (tailwind: last:border-b-0)

export default function StationList() {
    const [stations] = useState([
        {
            id: 1,
            name: "Station A",
            address: "123 Đường A, TP.HCM",
            latitude: 10.88,
            longitude: 106.805,
            is_active: true,
            created_at: "2025-10-01",
            updated_at: "2025-10-05",
        },
        {
            id: 2,
            name: "Station B",
            address: "456 Đường B, TP.HCM",
            latitude: 10.87,
            longitude: 106.81,
            is_active: false,
            created_at: "2025-09-20",
            updated_at: "2025-09-25",
        },
        {
            id: 3,
            name: "Station C",
            address: "789 Đường C, TP.HCM",
            latitude: 10.865,
            longitude: 106.795,
            is_active: true,
            created_at: "2025-09-10",
            updated_at: "2025-09-15",
        },
    ]);

    const [selected, setSelected] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // menu state rendered via portal (so it doesn't affect table layout)
    const [menuState, setMenuState] = useState({ open: false, x: 0, y: 0, id: null });

    // map and routing refs so we can reuse / remove them
    const mapRef = useRef(null);
    const routingControlRef = useRef(null);

    // initialize base map (marker only) when modal opens
    useEffect(() => {
        if (showModal && selected) {
            // initialize map once
            initMap(selected);
        }

        return () => {
            // cleanup when modal closed
            if (!showModal) {
                if (routingControlRef.current && mapRef.current) {
                    try {
                        mapRef.current.removeControl(routingControlRef.current);
                    } catch (e) { }
                    routingControlRef.current = null;
                }
                if (mapRef.current) {
                    try {
                        mapRef.current.remove();
                    } catch (e) { }
                    mapRef.current = null;
                }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showModal, selected]);

    const initMap = (station) => {
        // remove existing map if any (safe to call multiple times)
        if (mapRef.current) {
            try {
                mapRef.current.remove();
            } catch (e) { }
            mapRef.current = null;
        }
        // create map
        mapRef.current = L.map("map", { zoomControl: true }).setView([station.latitude, station.longitude], 15);

        L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
        }).addTo(mapRef.current);

        const icon = L.icon({
            iconUrl: "https://unpkg.com/leaflet/dist/images/marker-icon.png",
            shadowUrl: "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
        });

        L.marker([station.latitude, station.longitude], { icon })
            .addTo(mapRef.current)
            .bindPopup(`${station.name}`)
            .openPopup();

        // small delay to ensure map container is visible and size is correct
        setTimeout(() => {
            try {
                mapRef.current.invalidateSize();
            } catch (e) { }
        }, 150);
    };

    const showRouteToStation = (station) => {
        if (!navigator.geolocation) {
            alert("Trình duyệt không hỗ trợ định vị");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;

                // Ensure map exists
                if (!mapRef.current) {
                    initMap(station);
                }

                // remove previous routing control if present
                if (routingControlRef.current && mapRef.current) {
                    try {
                        mapRef.current.removeControl(routingControlRef.current);
                    } catch (e) { }
                    routingControlRef.current = null;
                }

                // set view to include user location
                mapRef.current.setView([lat, lon], 13);

                const icon = L.icon({
                    iconUrl: "https://unpkg.com/leaflet/dist/images/marker-icon.png",
                    shadowUrl: "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41],
                });

                // add user marker
                L.marker([lat, lon], { icon }).addTo(mapRef.current).bindPopup("Vị trí của bạn").openPopup();

                // add destination marker (if not already added)
                L.marker([station.latitude, station.longitude], { icon }).addTo(mapRef.current).bindPopup(station.name);

                // add routing control
                try {
                    routingControlRef.current = L.Routing.control({
                        waypoints: [L.latLng(lat, lon), L.latLng(station.latitude, station.longitude)],
                        lineOptions: { styles: [{ color: "#0a850f", weight: 4 }] },
                        addWaypoints: false,
                        draggableWaypoints: false,
                        fitSelectedRoutes: true,
                        showAlternatives: false,
                    }).addTo(mapRef.current);
                } catch (e) {
                    console.error(e);
                    alert("Không thể tính đường đi (routing service lỗi)");
                }
            },
            (err) => {
                alert("Lỗi định vị: " + err.message);
            },
            { enableHighAccuracy: true }
        );
    };

    // click handler for ellipsis button to show portal menu
    const onEllipsisClick = (e, s) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        // place menu slightly left so it's visible
        const width = 160;
        const left = Math.max(8, rect.right - width);
        const top = rect.bottom + window.scrollY + 6;

        setMenuState((prev) => {
            // toggle same menu
            if (prev.open && prev.id === s.id) return { open: false, x: 0, y: 0, id: null };
            return { open: true, x: left, y: top, id: s.id };
        });
    };

    useEffect(() => {
        const onDocClick = () => setMenuState({ open: false, x: 0, y: 0, id: null });
        document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, []);

    return (
        <div className="p-6 min-h-screen">
            <h1 className="text-2xl font-semibold mb-4 text-gray-800">Danh sách trạm</h1>

            <div className="rounded-lg shadow bg-white">
                <div className="overflow-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="p-3">Tên trạm</th>
                                <th className="p-3">Địa chỉ</th>
                                <th className="p-3">Trạng thái</th>
                                <th className="p-3">Ngày tạo</th>
                                <th className="p-3">Cập nhật</th>
                                <th className="p-3">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stations.map((s) => (
                                <tr key={s.id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                                    <td className="p-3 font-medium text-gray-800">{s.name}</td>
                                    <td className="p-3 text-gray-600">{s.address}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.is_active ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                                            {s.is_active ? "Hoạt động" : "Ngưng"}
                                        </span>
                                    </td>
                                    <td className="p-3 text-gray-600">{s.created_at}</td>
                                    <td className="p-3 text-gray-600">{s.updated_at}</td>
                                    <td className="p-3 flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setSelected(s);
                                                setShowModal(true);
                                                // close menu if any
                                                setMenuState({ open: false, x: 0, y: 0, id: null });
                                            }}
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
                    <div
                        style={{ position: "absolute", top: menuState.y, left: menuState.x, zIndex: 9999 }}
                        className="w-40 bg-white border rounded shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 text-gray-700"
                            onClick={() => {
                                alert("Cập nhật trạm id=" + menuState.id);
                                setMenuState({ open: false, x: 0, y: 0, id: null });
                            }}
                        >
                            Cập nhật
                        </button>
                        <button
                            className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 text-red-600"
                            onClick={() => {
                                alert("Xóa trạm id=" + menuState.id);
                                setMenuState({ open: false, x: 0, y: 0, id: null });
                            }}
                        >
                            Xóa trạm
                        </button>
                    </div>,
                    document.body
                )
            )}

            {/* Modal */}
            {showModal && selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative">
                        <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-xl">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Chi tiết trạm
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-800"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-5 space-y-3 overflow-y-auto flex-1 min-h-0">
                            <p>
                                <strong>Tên:</strong> {selected.name}
                            </p>
                            <p>
                                <strong>Địa chỉ:</strong> {selected.address}
                            </p>
                            <p>
                                <strong>Trạng thái:</strong> {selected.is_active ? "Hoạt động" : "Ngưng"}
                            </p>
                            <p>
                                <strong>Ngày tạo:</strong> {selected.created_at}
                            </p>
                            <p>
                                <strong>Cập nhật:</strong> {selected.updated_at}
                            </p>

                            <div className="border rounded-lg overflow-hidden mt-4">
                                <div id="map" className="h-96 w-full"></div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => showRouteToStation(selected)}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Hiển thị đường đi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
