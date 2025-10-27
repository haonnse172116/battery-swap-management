import { CpuChipIcon, MapPinIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import BatteryStatusIndicator from './BatteryStatusIndicator';

const BatteryTableRow = ({
  battery,
  stations,
  batteryStatuses,
  getStatusInfo,
  onAssignToStation,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const statusInfo = getStatusInfo(battery.status);
  const station = stations.find(s => s.stationId === battery.stationId);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <CpuChipIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              Serial: {battery.serialNo}
            </div>
            <div className="text-sm text-gray-500">
              ID: {battery.batteryId}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {station ? (
          <div className="flex items-center">
            <MapPinIcon className="w-4 h-4 text-gray-400 mr-2" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                {station.stationName}
              </div>
              <div className="text-sm text-gray-500">
                {station.address}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-gray-500 italic">Chưa phân bổ</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="flex flex-col gap-2">
          <BatteryStatusIndicator
            currentCapacity={battery.currentCapacityWh || 0}
            totalCapacity={battery.capacityWh}
            status={battery.status}
            size="md"
          />
          <div className="text-xs text-gray-500">
            {battery.currentCapacityWh || 0} / {battery.capacityWh} Wh
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {battery.batteryTypeName || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          {/* Assign to Station */}
          <select
            value={battery.stationId || ''}
            onChange={(e) => onAssignToStation(battery.batteryId, e.target.value)}
            className="text-xs px-2 py-1 border border-gray-300 rounded"
          >
            <option value="">Chưa phân bổ</option>
            {stations.map((station) => (
              <option key={station.stationId} value={station.stationId}>
                {station.name}
              </option>
            ))}
          </select>

          {/* Status Change */}
          <select
            value={battery.status}
            onChange={(e) => onStatusChange(battery.batteryId, e.target.value)}
            className="text-xs px-2 py-1 border border-gray-300 rounded"
          >
            {batteryStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => onEdit(battery)}
            className="text-blue-600 hover:text-blue-800"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(battery.batteryId)}
            className="text-red-600 hover:text-red-800"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default BatteryTableRow;