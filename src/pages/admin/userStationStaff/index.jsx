import React, { useState } from 'react';

const mockStaff = [
  { id: 1, name: 'Nguyễn Văn A', email: 'a@gmail.com' },
  { id: 2, name: 'Trần Thị B', email: 'b@gmail.com' },
  { id: 3, name: 'Lê Văn C', email: 'c@gmail.com' },
  { id: 4, name: 'Phạm Thị D', email: 'd@gmail.com' },
];

const mockStations = [
  { id: 101, name: 'Trạm A' },
  { id: 102, name: 'Trạm B' },
  { id: 103, name: 'Trạm C' },
];

const UserStationStaff = () => {
  // staff chưa phân vào trạm
  const [unassigned, setUnassigned] = useState(mockStaff);
  // staff đã phân vào từng trạm
  const [stationStaff, setStationStaff] = useState({
    101: [],
    102: [],
    103: [],
  });
  const [dragged, setDragged] = useState(null);

  // Kéo staff
  const handleDragStart = (staff) => setDragged(staff);
  const handleDragEnd = () => setDragged(null);
  // Thả vào trạm
  const handleDrop = (stationId) => {
    if (!dragged) return;
    setUnassigned(prev => prev.filter(s => s.id !== dragged.id));
    setStationStaff(prev => ({
      ...prev,
      [stationId]: [...prev[stationId], dragged],
    }));
    setDragged(null);
  };
  // Bỏ phân công (kéo ra lại)
  const handleRemoveFromStation = (stationId, staff) => {
    setStationStaff(prev => ({
      ...prev,
      [stationId]: prev[stationId].filter(s => s.id !== staff.id),
    }));
    setUnassigned(prev => [...prev, staff]);
  };

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">Phân nhân viên vào trạm</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Danh sách nhân viên chưa phân */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Chưa phân công</h2>
          <div className="space-y-3 min-h-[120px]">
            {unassigned.length === 0 ? (
              <div className="p-4 text-gray-400 bg-white rounded shadow text-center">Không có nhân viên</div>
            ) : (
              unassigned.map(staff => (
                <div
                  key={staff.id}
                  className={`bg-white rounded shadow p-4 flex items-center gap-3 border border-gray-100 cursor-move hover:bg-blue-50 ${dragged && dragged.id === staff.id ? 'opacity-50' : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(staff)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="font-medium text-gray-800">{staff.name}</div>
                  <div className="text-xs text-gray-500">{staff.email}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Các trạm */}
        <div className="flex-[2] grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockStations.map(station => (
            <div
              key={station.id}
              className="bg-white rounded-xl shadow p-4 min-h-[180px] flex flex-col border-2 border-dashed border-gray-200 hover:border-blue-400 transition-all"
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(station.id)}
            >
              <div className="font-semibold text-blue-700 mb-2">{station.name}</div>
              <div className="flex-1 space-y-2">
                {stationStaff[station.id].length === 0 ? (
                  <div className="text-gray-400 text-sm">Chưa có nhân viên</div>
                ) : (
                  stationStaff[station.id].map(staff => (
                    <div key={staff.id} className="flex items-center justify-between bg-blue-50 rounded px-3 py-2">
                      <div>
                        <span className="font-medium text-gray-800">{staff.name}</span>
                        <span className="ml-2 text-xs text-gray-500">{staff.email}</span>
                      </div>
                      <button
                        className="text-xs text-red-500 hover:underline ml-2"
                        onClick={() => handleRemoveFromStation(station.id, staff)}
                      >Bỏ phân công</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserStationStaff;