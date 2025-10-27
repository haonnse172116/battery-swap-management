import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

const BatteryFilters = ({
  searchSerial,
  setSearchSerial,
  selectedStation,
  setSelectedStation,
  selectedStatus,
  setSelectedStatus,
  stations,
  batteryStatuses,
  onAddBattery,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search by Serial */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tìm theo số serial
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchSerial}
              onChange={(e) => setSearchSerial(e.target.value)}
              placeholder="Nhập số serial..."
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filter by Station */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạm
          </label>
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả trạm</option>
            <option value="">Chưa phân bổ</option>
            {stations.map((station) => (
              <option key={station.stationId} value={station.stationId}>
                {station.stationName}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            {batteryStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Add Battery Button */}
        <div className="flex items-end">
          <button
            onClick={onAddBattery}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Thêm pin mới
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatteryFilters;