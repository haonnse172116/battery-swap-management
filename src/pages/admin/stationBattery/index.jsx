import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useGetAllBatteriesQuery, useAssignBatteriesToStationMutation } from '@/services/battery.service';
import { useGetStationsQuery } from '@/services/station.service';

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

function BatteryCard({ battery, onAdd, disabled }) {
  if (!battery) return null;
  return (
    <div
      className="border rounded p-3 bg-white shadow-sm flex flex-wrap-reverse items-center justify-between"
      draggable={!disabled}
      onDragStart={(e) => {
        if (disabled) return;
        e.dataTransfer.setData('text/batteryId', String(battery.id ?? battery.batteryId ?? battery.serialNo));
      }}
    >
      <div className="flex items-center gap-3">
        <ImageWithFallback src={battery.imageUrl} alt="Battery" className="w-12 h-12 object-contain" />
        <div>
          <div className="font-medium">#{battery.id || battery.batteryId || battery.serialNo}</div>
          <div className="text-sm">Serial No: {battery.serialNo || '—'}</div>
          <div className="text-sm text-gray-500">Loại pin: {battery.batteryTypeName || battery.type || ''}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor[battery.status] || 'bg-gray-100 text-gray-700'}`}>{battery.status || '—'}</span>
        <button
          type="button"
          onClick={() => onAdd && onAdd(battery)}
          disabled={disabled}
          className={`px-2 py-1 rounded ${disabled ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function StationBattery() {
  // paging/search/sort states
  const [page] = useState(1);
  const [pageSize] = useState(100000); // fetch many for client-side filtering
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('serialNo');
  const [sortOrder, setSortOrder] = useState('asc');

  // station view state
  const [viewStationId, setViewStationId] = useState('');
  const [selected, setSelected] = useState([]); // selected battery ids to assign
  const [assigning, setAssigning] = useState(false);

  // fetch data
  const { data: batteriesData, isLoading: loadingBatteries, refetch: refetchBatteries } = useGetAllBatteriesQuery({ page, pageSize, search: '' });
  const allBatteries = batteriesData?.content || [];

  const { data: stationsData, isLoading: loadingStations, refetch: refetchStations } = useGetStationsQuery({ page: 1, pageSize: 200 });
  const stations = stationsData?.content || [];

  const [assignBulk, { isLoading: _assigning }] = useAssignBatteriesToStationMutation();

  // derived lists
  // available (unassigned) batteries: no stationId and not InUse
  const availableBatteries = useMemo(() => allBatteries.filter(b => !b.stationId && String(b.status || '').toLowerCase() !== 'inuse'), [allBatteries]);

  // batteries already assigned to currently open station
  const assignedToStation = useMemo(() => {
    if (!viewStationId) return [];
    return allBatteries.filter(b => b && String(b.stationId) === String(viewStationId));
  }, [allBatteries, viewStationId]);

  // filtered & sorted available list shown on left
  const filtered = useMemo(() => {
    let list = availableBatteries.slice();

    // status filter (exact match)
    if (statusFilter) list = list.filter(b => String(b.status) === String(statusFilter));

    // - tokenizes search by whitespace
    // - builds a haystack of searchable fields and requires every token to be present somewhere
    const q = (search || '').trim().toLowerCase();
    if (q) {
      const tokens = q.split(/\s+/).filter(Boolean);
      list = list.filter((b) => {
        const hay = [
          b.id,
          b.batteryId,
          b.serialNo,
          b.batteryTypeName,
          b.type,
          b.status,
          b.voltage,
          b.capacityWh
        ].filter(Boolean).join(' ').toLowerCase();
        return tokens.every(t => hay.indexOf(t) !== -1);
      });
    }

    list.sort((a, b) => {
      const A = String(a[sortField] || '').toLowerCase();
      const B = String(b[sortField] || '').toLowerCase();
      if (A < B) return sortOrder === 'asc' ? -1 : 1;
      if (A > B) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [availableBatteries, statusFilter, search, sortField, sortOrder]);

  // helpers
  const openStation = (id) => {
    setViewStationId(String(id));
    setSelected([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const backToStations = () => {
    setViewStationId('');
    setSelected([]);
    setSearch('');
    setStatusFilter('');
    refetchBatteries && refetchBatteries();
    refetchStations && refetchStations();
  };

  const handleAdd = useCallback((battery) => {
    if (!battery) return;
    const id = String(battery.id || battery.batteryId || battery.serialNo || '');
    if (!id) {
      toast.error('Không xác định được mã pin.');
      return;
    }
    // don't add if already in assignedToStation or already selected
    if (assignedToStation.some(s => String(s.id || s.batteryId || s.serialNo) === id)) {
      toast.error('Pin đã có trạm, không thể thêm.');
      return;
    }
    setSelected(prev => prev.includes(id) ? prev : [...prev, id]);
  }, [assignedToStation]);

  const handleRemoveSelected = (id) => setSelected(prev => prev.filter(x => x !== id));

  // drag & drop handling to add a single battery
  const onDropToStation = (e) => {
    e.preventDefault();
    const batteryId = e.dataTransfer.getData('text/batteryId');
    if (!batteryId) return;
    if (!viewStationId) {
      toast.error('Chọn trạm trước khi thêm pin');
      return;
    }
    // don't add if already assigned
    if (assignedToStation.some(s => String(s.id || s.batteryId || s.serialNo) === String(batteryId))) {
      toast.error('Pin đã có trạm này');
      return;
    }
    setSelected(prev => prev.includes(batteryId) ? prev : [...prev, batteryId]);
  };
  const onDragOver = (e) => e.preventDefault();

  // assign selected to viewStation
  const handleAssign = async () => {
    if (!viewStationId) return toast.error('Vui lòng mở một trạm trước khi điều phối');
    if (!selected.length) return toast.error('Chưa chọn pin để điều phối');
    setAssigning(true);
    try {
      await toast.promise(assignBulk({ data: [{ stationId: String(viewStationId), batteryIds: selected }] }).unwrap(), {
        loading: 'Đang điều phối pin...',
        success: 'Điều phối pin thành công',
        error: (err) => err?.data?.message || 'Điều phối thất bại',
      });
      setSelected([]);
      await refetchBatteries();
    } catch (err) {
      // handled by toast.promise
    } finally {
      setAssigning(false);
    }
  };

  // UI: station cards view (initial) or two-column view if viewStationId set
  return (
    <div className="p-6 min-h-screen">
      {/* Title / Breadcrumb */}
      <div className="mb-6">
        {!viewStationId ? (
          <h1 className="text-2xl font-semibold text-gray-800">Điều phối pin & danh sách trạm</h1>
        ) : (
          <nav className="text-lg text-gray-600" aria-label="Breadcrumb">
            <ol className="list-reset flex items-center gap-2">
              <li><button onClick={backToStations} className="text-blue-600 hover:underline">Danh sách trạm</button></li>
              <li className="text-gray-400">/</li>
              <li className="font-semibold text-gray-800">{stations.find(s => String(s.stationId || s.id) === String(viewStationId))?.name || 'Trạm'}</li>
            </ol>
          </nav>
        )}
      </div>

      {/* Station cards grid */}
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

                  <div className="mt-6">
                    <button onClick={() => openStation(st.stationId || st.id)} className="block mx-auto w-3/4 text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                      Quản lý điều pin trạm
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Two-column view when a station is opened */}
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

          <div className="flex flex-wrap items-center gap-3">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm id / serial / loại / trạng thái..." className="border rounded px-3 py-2 w-64" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded px-3 py-2">
              <option value="">Tất cả trạng thái</option>
              <option value="Available">Available</option>
              <option value="InUse">InUse</option>
              <option value="Charging">Charging</option>
              <option value="Damaged">Damaged</option>
              <option value="Maintenance">Maintenance</option>
              <option value="QualityCheck">QualityCheck</option>
            </select>
            <select value={sortField} onChange={e => setSortField(e.target.value)} className="border rounded px-3 py-2">
              <option value="serialNo">Số series</option>
              <option value="batteryTypeName">Loại pin</option>
              <option value="id">ID</option>
            </select>
            <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="px-3 py-2 border rounded">{sortOrder === 'asc' ? '↑ Tăng dần' : '↓ Giảm dần'}</button>
            <button onClick={() => { refetchBatteries && refetchBatteries(); }} className="px-3 py-2 bg-blue-600 text-white rounded">Làm mới</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: available batteries */}
            <div>
              <div className="text-medium text-gray-600 mb-2">Pin chưa được điều phối</div>
              <div className="space-y-2 h-[70vh] overflow-auto p-2 bg-gray-50 rounded">
                {loadingBatteries ? (
                  <div>Đang tải...</div>
                ) : filtered.length === 0 ? (
                  <div className="text-center text-gray-500 py-6">Không có pin sẵn sàng</div>
                ) : (
                  filtered.map(b => (
                    <div key={b.id || b.batteryId || b.serialNo} className="mb-2">
                      <BatteryCard battery={b} onAdd={handleAdd} disabled={assignedToStation.some(s => String(s.id || s.batteryId || s.serialNo) === String(b.id || b.batteryId || b.serialNo))} />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: station area (assigned + selected) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Trạm: {(stations.find(s => String(s.stationId || s.id) === String(viewStationId))?.name) || '—'}</div>
                <div className="text-sm text-gray-500">Pin đã ở trạm: <span className="font-semibold">{assignedToStation.length}</span></div>
              </div>

              {/* Assigned to station (already on server) */}
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-2">Pin đã ở trạm</div>
                <div className="space-y-2 p-2 bg-white border rounded h-40 overflow-auto">
                  {assignedToStation.length === 0 ? (
                    <div className="text-gray-400 text-sm">Chưa có pin nào ở trạm này</div>
                  ) : (
                    assignedToStation.filter(Boolean).map(b => (
                      <div key={String(b.id || b.batteryId || b.serialNo)} className="flex items-center justify-between p-2 border rounded bg-white">
                        <div className="flex items-center gap-3">
                          <ImageWithFallback src={b?.imageUrl} alt="Battery" className="w-12 h-12 object-contain" />
                          <div>
                            <div className="font-medium">#{b.id || b.batteryId || b.serialNo}</div>
                            <div className="text-sm">Serial No: {b.serialNo || '—'}</div>
                            <div className="text-xs text-gray-500">Loại pin: {b.batteryTypeName || b.type || '—'}</div>
                          </div>
                        </div>
                        <div className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor[b.status] || 'bg-gray-100 text-gray-700'}`}>{b.status || '—'}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Drop zone + selected to assign */}
              <div
                onDrop={onDropToStation}
                onDragOver={onDragOver}
                className="min-h-[36vh] border-2 border-dashed rounded p-3 bg-white"
              >
                {selected.length === 0 ? (
                  <div className="text-gray-500 text-center py-10">Kéo thả pin vào đây hoặc nhấn + trên thẻ pin để thêm vào trạm</div>
                ) : (
                  <div className="space-y-2">
                    {selected.map(id => {
                      const b = availableBatteries.find(x => String(x.id || x.batteryId || x.serialNo) === String(id)) || allBatteries.find(x => String(x.id || x.batteryId || x.serialNo) === String(id)) || {};
                      return (
                        <div key={id} className="flex items-center justify-between border rounded p-2">
                          <div className="flex items-center gap-3">
                            <ImageWithFallback src={b?.imageUrl} alt="Battery" className="w-12 h-12 object-contain" />
                            <div>
                              <div className="font-medium">#{b.id || b.batteryId || b.serialNo || id}</div>
                              <div className="text-sm">Serial No: {b.serialNo || '—'}</div>
                              <div className="text-xs text-gray-500">Loại pin: {b.batteryTypeName || b.type || '—'}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={() => handleRemoveSelected(id)}>Xóa</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-4 justify-end">
                <button disabled={assigning} onClick={handleAssign} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60">
                  {assigning ? 'Đang điều phối...' : 'Điều pin vào trạm'}
                </button>
                <button onClick={() => setSelected([])} className="px-4 py-2 bg-gray-100 rounded">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
