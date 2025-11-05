import React, { useState, useMemo } from 'react';
import { useGetStationsQuery } from '@/services/station.service';
import { useGetBatteriesByStationQuery, useGetAllBatteriesQuery } from '@/services/battery.service';
import { useDebounce } from '@/hooks/useDebounce';

const statusColor = {
  Available: 'bg-green-100 text-green-700',
  InUse: 'bg-yellow-100 text-yellow-700',
  Charging: 'bg-blue-100 text-blue-700',
  Damaged: 'bg-red-100 text-red-700',
  Maintenance: 'bg-gray-100 text-gray-700',
  QualityCheck: 'bg-indigo-100 text-indigo-700',
};

function ImageWithFallback({ src, alt, className }) {
  const fallback = '/android-chrome-512x512.png';
  return <img src={src || fallback} alt={alt} className={className} onError={(e) => { e.currentTarget.src = fallback; }} />;
}

export default function BatteryList() {
  const [viewingStationId, setViewingStationId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('serialNo');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedBattery, setSelectedBattery] = useState(null);

  const { data: stationsData } = useGetStationsQuery({ page: 1, pageSize: 12 });
  const stations = stationsData?.content || [];

  // fetch all batteries to compute per-station aggregated counts used on station cards
  const { data: allBatteriesData } = useGetAllBatteriesQuery({ page: 1, pageSize: 1000 });
  const allBatteries = allBatteriesData?.content || [];

  const currentStation = viewingStationId ? stations.find(s => (s.stationId || s.id) === viewingStationId) : null;

  const { data: batteriesData, isLoading: batteriesLoading, refetch } = useGetBatteriesByStationQuery({ stationId: viewingStationId, page, pageSize, search: debouncedSearch }, { skip: !viewingStationId });

  const batteries = batteriesData?.content || [];
  const pagination = batteriesData?.pagination || { page: page, totalCount: batteries.length, pageSize };

  const totalPages = Math.max(1, Math.ceil((pagination.totalCount || batteries.length) / (pagination.pageSize || pageSize)));

  const openStation = (stationId) => { setViewingStationId(stationId); setPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const backToStations = () => { setViewingStationId(null); setSelectedBattery(null); };

  const filteredSorted = useMemo(() => {
    let list = [...batteries];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(b => (b.serialNo?.toString() || '').toLowerCase().includes(q) || (b.batteryId || '').toLowerCase().includes(q) || (b.batteryTypeName || '').toLowerCase().includes(q));
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

      {/* Station cards */}
      {!currentStation && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {stations.map(station => {
            const countsList = allBatteries.filter(b => (b.stationId || b.station_id) === (station.stationId || station.id));
            const counts = { total: countsList.length, ready: countsList.filter(b => b.status === 'Available').length, broken: countsList.filter(b => b.status === 'Damaged' || b.status === 'hỏng').length };
            return (
              <div key={station.stationId || station.id} className="relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="absolute right-3 top-3">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${station.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {station.isActive ? 'Hoạt động' : 'Ngưng'}
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

                  <div className="mt-6">
                    <button onClick={() => openStation(station.stationId || station.id)} className="block mx-auto w-3/4 text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                      Chi tiết danh sách pin
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Battery list */}
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

          <div className="flex flex-wrap items-center gap-3">
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm theo serial, loại..." className="border rounded px-3 py-2 w-64" />
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

          <div>
            {batteriesLoading ? (
              <div className="p-6 text-center">Đang tải...</div>
            ) : filteredSorted.length === 0 ? (
              <div className="bg-white p-6 rounded-lg text-center text-gray-500 shadow-sm">Không có pin ở trạm này</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSorted.map(b => (
                  <div key={b.batteryId || b.batteryId} className="bg-white rounded-lg shadow p-4 border border-gray-200 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm text-gray-500">Serial No. <span className="font-semibold text-gray-800">{b.serialNo}</span></div>

                      </div>
                      <div>
                        <div className={`text-xs font-semibold px-2 py-1 rounded ${statusColor[b.status] || 'bg-gray-100 text-gray-700'}`}>{b.status}</div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">Loại: {b.batteryTypeName || b.batteryTypeId}</div>
                    <div className="text-xs text-gray-500">Điện áp: {b.voltage} | Dung lượng: {b.capacityWh} Wh</div>
                    {b.reservationId && <div className="text-xs text-yellow-700 font-medium">Reservation: {b.reservationId}</div>}

                    <div className="mt-3">
                      <button onClick={() => setSelectedBattery(b)} className="w-full px-3 py-2 bg-gray-100 rounded text-sm hover:bg-gray-200">Xem chi tiết</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* pagination */}
          <div className="flex items-center gap-2 justify-center py-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border rounded disabled:opacity-50">Trước</button>
            <div className="px-3 py-1">{page} / {totalPages}</div>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Sau</button>
          </div>

          {/* Battery detail modal */}
          {selectedBattery && (
            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
              <div className="absolute inset-0" onClick={() => setSelectedBattery(null)} />
              <div className="relative z-10 w-[min(95%,800px)] bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b bg-gradient-to-r from-blue-50 to-blue-100 flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    🔋 Chi tiết pin
                  </h3>
                  <button
                    onClick={() => setSelectedBattery(null)}
                    className="text-gray-500 hover:text-red-500 text-xl leading-none"
                  >
                    ✕
                  </button>
                </div>

                {/* Nội dung */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Ảnh */}
                  <div className="md:col-span-1 flex justify-center items-start">
                    <ImageWithFallback src={selectedBattery.imageUrl || selectedBattery.imageURL} alt={`Battery ${selectedBattery.batteryId}`} className="w-full h-44 object-cover rounded-md border" />
                  </div>

                  {/* Thông tin */}
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {[
                      ['Battery ID', selectedBattery.batteryId],
                      ['Serial No', selectedBattery.serialNo],
                      ['Owner', selectedBattery.owner],
                      ['Status', selectedBattery.status],
                      ['Voltage', selectedBattery.voltage],
                      ['Capacity (Wh)', selectedBattery.capacityWh],
                      ['Current Capacity (Wh)', selectedBattery.currentCapacityWh ?? '-'],
                      ['Station', selectedBattery.stationName || selectedBattery.stationId],
                      ['Battery Type', selectedBattery.batteryTypeName || selectedBattery.batteryTypeId],
                      ['Reservation', selectedBattery.reservationId || '-'],
                      ['Created', selectedBattery.createdAt ? new Date(selectedBattery.createdAt).toLocaleString() : '-'],
                      ['Updated', selectedBattery.updatedAt ? new Date(selectedBattery.updatedAt).toLocaleString() : '-'],
                    ].map(([label, value]) => (
                      <div key={label} className="flex flex-col border border-gray-100 rounded-md p-2 bg-gray-50/40 hover:bg-gray-100/60 transition">
                        <span className="text-gray-500 text-xs">{label}</span>
                        <span className="font-medium text-gray-800 break-words">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
