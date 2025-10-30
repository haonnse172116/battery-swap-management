import React, { useEffect, useMemo, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useGetAllBatteriesQuery, useAssignBatteriesToStationMutation } from '@/services/battery.service';
import { useGetStationsQuery } from '@/services/station.service';

// Two-column station battery assign page.
// Left: list of batteries without station (search/filter/sort, draggable, plus-button to add to right)
// Right: station selector + selected battery cards and Assign (bulk) button.

const statusColor = {
  Available: 'bg-green-100 text-green-700',
  InUse: 'bg-yellow-100 text-yellow-700',
  Charging: 'bg-blue-100 text-blue-700',
  Damaged: 'bg-red-100 text-red-700',
  Maintenance: 'bg-gray-100 text-gray-700',
  QualityCheck: 'bg-indigo-100 text-indigo-700',
};

function BatteryCard({ battery, onAdd }) {
  return (
    <div className="border rounded p-3 bg-white shadow-sm flex items-center justify-between" draggable onDragStart={(e) => { e.dataTransfer.setData('text/batteryId', battery.id || battery.batteryId); }}>
      <div>
        <div className="font-medium">{battery.serialNo || battery.id || battery.batteryId}</div>
        <div className="text-sm text-gray-500">{battery.batteryTypeName || battery.type || ''}</div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor[battery.status] || 'bg-gray-100 text-gray-700'}`}>{battery.status}</span>
        <button type="button" onClick={() => onAdd(battery)} className="px-2 py-1 bg-blue-600 text-white rounded">+</button>
      </div>
    </div>
  );
}

export default function StationBattery() {
  const [page] = useState(1);
  const [pageSize] = useState(100000); // fetch many and filter client-side
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('serialNo');
  const [sortOrder, setSortOrder] = useState('asc');

  // fetch all batteries (server-side page size large to get unassigned)
  const { data: batteriesData, isLoading: loadingBatteries, refetch } = useGetAllBatteriesQuery({ page, pageSize, search });
  const allBatteries = batteriesData?.content || [];

  // only include batteries that don't have station assigned (assumption: stationId is null/empty when unassigned)
  const availableBatteries = useMemo(() => allBatteries.filter(b => !b.stationId && b.status !== 'InUse'), [allBatteries]);

  const { data: stationsData } = useGetStationsQuery({ page: 1, pageSize: 100000 });
  const stations = stationsData?.content || [];

  const [selectedStationId, setSelectedStationId] = useState('');
  const [selected, setSelected] = useState([]); // list of battery ids selected to assign

  const [assignBulk, { isLoading: assigning }] = useAssignBatteriesToStationMutation();

  useEffect(() => { if (!selectedStationId) setSelected([]); }, [selectedStationId]);

  const filtered = useMemo(() => {
    let list = availableBatteries.slice();
    if (statusFilter) list = list.filter(b => b.status === statusFilter);
    if (search) list = list.filter(b => String(b.serialNo || b.id || b.batteryId).toLowerCase().includes(search.toLowerCase()));
    list.sort((a, b) => {
      const A = String(a[sortField] || '').toLowerCase();
      const B = String(b[sortField] || '').toLowerCase();
      if (A < B) return sortOrder === 'asc' ? -1 : 1;
      if (A > B) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [availableBatteries, statusFilter, search, sortField, sortOrder]);

  const handleAdd = useCallback((battery) => {
    const id = battery.id || battery.batteryId || battery.serialNo;
    setSelected(prev => prev.includes(id) ? prev : [...prev, id]);
  }, []);

  const handleRemoveSelected = (id) => setSelected(prev => prev.filter(x => x !== id));

  // drag over station drop area
  const onDropToStation = async (e) => {
    e.preventDefault();
    const batteryId = e.dataTransfer.getData('text/batteryId');
    if (!batteryId) return;
    if (!selectedStationId) return toast.error('Chọn trạm trước khi thêm pin');
    setSelected(prev => prev.includes(batteryId) ? prev : [...prev, batteryId]);
  };

  const onDragOver = (e) => e.preventDefault();

  const handleAssign = async () => {
    if (!selectedStationId) return toast.error('Vui lòng chọn trạm');
    if (!selected.length) return toast.error('Chưa chọn pin nào để điều phối');
    try {
      await toast.promise(assignBulk({ data: [{ stationId: selectedStationId, batteryIds: selected }] }).unwrap(), {
        loading: 'Đang điều phối pin...',
        success: 'Điều phối pin thành công',
        error: (err) => err?.data?.message || 'Điều phối thất bại',
      });
      setSelected([]);
      await refetch();
    } catch (err) {
      // handled by toast.promise
    }
  };

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-semibold mb-4">Điều phối pin cho trạm</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: available batteries + controls */}
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <input className="border rounded px-3 py-2 flex-1" placeholder="Tìm kiếm mã pin..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="border rounded px-3 py-2" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="Available">Available</option>
              <option value="InUse">InUse</option>
              <option value="Charging">Charging</option>
              <option value="Damaged">Damaged</option>
            </select>
            <select className="border rounded px-3 py-2" value={sortField} onChange={e => setSortField(e.target.value)}>
              <option value="serialNo">Serial</option>
              <option value="batteryTypeName">Type</option>
            </select>
            <select className="border rounded px-3 py-2" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>

          <div className="space-y-2 h-[60vh] overflow-auto p-2 bg-gray-50 rounded">
            {loadingBatteries ? <div>Loading...</div> : (
              filtered.length === 0 ? <div className="text-center text-gray-500 py-6">Không có pin sẵn sàng</div> : (
                filtered.map(b => (
                  <div key={b.id || b.batteryId || b.serialNo} className="mb-2">
                    <BatteryCard battery={b} onAdd={handleAdd} />
                  </div>
                ))
              )
            )}
          </div>
        </div>

        {/* Right: station selector and selected list (drop target) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-medium">{(stations.find(s => s.stationId === selectedStationId || s.id === selectedStationId)?.name) || 'Chưa chọn trạm'}</div>
            <select className="border rounded px-3 py-2" value={selectedStationId} onChange={e => setSelectedStationId(e.target.value)}>
              <option value="">-- Chọn trạm --</option>
              {stations.map(s => <option key={s.stationId || s.id} value={s.stationId || s.id}>{s.name || s.stationName}</option>)}
            </select>
          </div>

          <div onDrop={onDropToStation} onDragOver={onDragOver} className="min-h-[40vh] border-2 border-dashed rounded p-3 bg-white">
            {selected.length === 0 ? (
              <div className="text-gray-500 text-center py-10">Kéo thả pin vào đây hoặc nhấn + trên thẻ pin để thêm vào trạm</div>
            ) : (
              <div className="space-y-2">
                {selected.map(id => {
                  const b = availableBatteries.find(x => String(x.id || x.batteryId || x.serialNo) === String(id));
                  return (
                    <div key={id} className="flex items-center justify-between border rounded p-2">
                      <div>
                        <div className="font-medium">{b?.serialNo || b?.id || b?.batteryId || id}</div>
                        <div className="text-sm text-gray-500">{b?.batteryTypeName || b?.type}</div>
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

          <div className="flex items-center gap-3 mt-4">
            <button disabled={assigning} onClick={handleAssign} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60">{assigning ? 'Đang điều phối...' : 'Điều pin vào trạm'}</button>
            <button onClick={() => setSelected([])} className="px-4 py-2 bg-gray-100 rounded">Hủy</button>
          </div>
        </div>
      </div>
    </div>
  );
}