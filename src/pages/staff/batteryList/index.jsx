import React, { useState } from 'react';

const mockStations = [
    { station_id: 'ST01', name: 'Trạm A', address: '123 Đường A', is_active: true },
    { station_id: 'ST02', name: 'Trạm B', address: '456 Đường B', is_active: true },
    { station_id: 'ST03', name: 'Trạm C', address: '789 Đường C', is_active: false },
];

const mockBatteryTypes = {
    'BT01': 'Lithium 48V',
    'BT02': 'Lithium 60V',
};

const mockBatteries = [
    // Trạm A
    { battery_id: 'BAT001', station_id: 'ST01', battery_type_id: 'BT01', serial_no: 1001, status: 'sẵn sàng', voltage: '48V', capacity_wh: '3200', image_url: '', reservation_id: null },
    { battery_id: 'BAT002', station_id: 'ST01', battery_type_id: 'BT01', serial_no: 1002, status: 'đang sạc', voltage: '48V', capacity_wh: '3200', image_url: '', reservation_id: 'RSV01' },
    { battery_id: 'BAT003', station_id: 'ST01', battery_type_id: 'BT01', serial_no: 1003, status: 'hỏng', voltage: '48V', capacity_wh: '3200', image_url: '', reservation_id: null },
    // Trạm B
    { battery_id: 'BAT004', station_id: 'ST02', battery_type_id: 'BT02', serial_no: 2001, status: 'sẵn sàng', voltage: '60V', capacity_wh: '4000', image_url: '', reservation_id: null },
    { battery_id: 'BAT005', station_id: 'ST02', battery_type_id: 'BT02', serial_no: 2002, status: 'đang sử dụng', voltage: '60V', capacity_wh: '4000', image_url: '', reservation_id: null },
    // Trạm C
    { battery_id: 'BAT006', station_id: 'ST03', battery_type_id: 'BT01', serial_no: 3001, status: 'sẵn sàng', voltage: '48V', capacity_wh: '3200', image_url: '', reservation_id: null },
];

const statusColor = {
    'sẵn sàng': 'bg-green-100 text-green-700',
    'đang sử dụng': 'bg-yellow-100 text-yellow-700',
    'đang sạc': 'bg-blue-100 text-blue-700',
    'hỏng': 'bg-red-100 text-red-700',
};

export default function BatteryList() {
    // viewingStationId = null => show station cards
    // otherwise => show battery list of that station
    const [viewingStationId, setViewingStationId] = useState(null);

    const openStation = (stationId) => {
        setViewingStationId(stationId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const backToStations = () => {
        setViewingStationId(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // helpers
    const getCounts = (stationId) => {
        const list = mockBatteries.filter(b => b.station_id === stationId);
        return {
            total: list.length,
            ready: list.filter(b => b.status === 'sẵn sàng').length,
            broken: list.filter(b => b.status === 'hỏng').length,
        };
    };

    // currently viewed station object (if any)
    const currentStation = viewingStationId ? mockStations.find(s => s.station_id === viewingStationId) : null;

    return (
        <div className="p-6 min-h-screen">
            {/* Breadcrumb */}
            <div className="mb-6">
                {!currentStation ? (
                    <h1 className="text-2xl font-semibold text-gray-800">Danh sách pin theo trạm</h1>
                ) : (
                    <nav className="text-lg text-gray-600" aria-label="Breadcrumb">
                        <ol className="list-reset flex items-center gap-2">
                            <li>
                                <button onClick={backToStations} className="text-blue-600 hover:underline">Danh sách pin theo trạm</button>
                            </li>
                            <li className="text-gray-400">/</li>
                            <li className="font-semibold text-gray-800">{currentStation.name}</li>
                        </ol>
                    </nav>
                )}
            </div>

            {/* Station cards view */}
            {!currentStation && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {mockStations.map(station => {
                        const counts = getCounts(station.station_id);
                        return (
                            <div key={station.station_id} className="relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {/* tag top-right */}
                                <div className="absolute right-3 top-3">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${station.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {station.is_active ? 'Hoạt động' : 'Ngưng'}
                                    </span>
                                </div>

                                <div className="p-5">
                                    <div className="mb-1">
                                        <h2 className="text-lg font-bold text-gray-800">{station.name}</h2>
                                        <div className="text-sm text-gray-500 mt-1">{station.address}</div>
                                    </div>

                                    <div className="mt-4 border border-gray-300 rounded-lg bg-white shadow-sm">
                                        <div className="grid grid-cols-3 divide-x divide-gray-200 text-center p-3">
                                            <div className="px-2">
                                                <div className="text-sm text-gray-500">Tổng</div>
                                                <div className="text-lg font-semibold text-gray-800">{counts.total}</div>
                                            </div>
                                            <div className="px-2">
                                                <div className="text-sm text-gray-500">Sẵn sàng</div>
                                                <div className="text-lg font-semibold text-green-600">{counts.ready}</div>
                                            </div>
                                            <div className="px-2">
                                                <div className="text-sm text-gray-500">Hỏng</div>
                                                <div className="text-lg font-semibold text-red-600">{counts.broken}</div>
                                            </div>
                                        </div>
                                    </div>


                                    {/* chi tiết button */}
                                    <div className="mt-6">
                                        <button
                                            onClick={() => openStation(station.station_id)}
                                            className="block mx-auto w-3/4 text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                                        >
                                            Chi tiết danh sách pin
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Battery list view (when a station selected) */}
            {currentStation && (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">{currentStation.name}</h3>
                                <div className="text-sm text-gray-500">{currentStation.address}</div>
                            </div>
                            <div>
                                <button onClick={backToStations} className="text-sm text-gray-600 underline">Quay lại danh sách trạm</button>
                            </div>
                        </div>
                    </div>

                    <div>
                        {/* batteries grid */}
                        {mockBatteries.filter(b => b.station_id === currentStation.station_id).length === 0 ? (
                            <div className="bg-white p-6 rounded-lg text-center text-gray-500 shadow-sm">Không có pin ở trạm này</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {mockBatteries.filter(b => b.station_id === currentStation.station_id).map(b => (
                                    <div key={b.battery_id} className="bg-white rounded-lg shadow p-4 border border-gray-200 flex flex-col gap-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="text-sm text-gray-500">Mã pin</div>
                                                <div className="font-semibold text-gray-800">{b.battery_id}</div>
                                            </div>
                                            <div>
                                                <div className={`text-xs font-semibold px-2 py-1 rounded ${statusColor[b.status]}`}>{b.status}</div>
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-500">Serial: {b.serial_no}</div>
                                        <div className="text-xs text-gray-500">Loại: {mockBatteryTypes[b.battery_type_id]}</div>
                                        <div className="text-xs text-gray-500">Điện áp: {b.voltage} | Dung lượng: {b.capacity_wh} Wh</div>
                                        {b.reservation_id && <div className="text-xs text-yellow-700 font-medium">Reservation: {b.reservation_id}</div>}

                                        <div className="mt-3">
                                            <button className="w-full px-3 py-2 bg-gray-100 rounded text-sm hover:bg-gray-200">Xem chi tiết pin</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
