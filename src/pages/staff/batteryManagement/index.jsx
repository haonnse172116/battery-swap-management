import {
  ArrowRightIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  RectangleGroupIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import BatteryStatusIndicator from '../../../components/battery/BatteryStatusIndicator';
import {
  useGetBatteriesInStorageQuery,
  useGetBatterySlotsByStationQuery,
  useGetStaffInventorySummaryQuery,
  useUpdateBatterySlotMutation
} from '../../../services/battery.service.js';
import { useGetAllBatteryTypesQuery } from '../../../services/batteryType.service.js';

const StaffBatteryManagement = () => {
  const [selectedBatteryType, setSelectedBatteryType] = useState('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedBattery, setSelectedBattery] = useState(null);

  const [staffStationId] = useState('station-001');

  const { data: batteryTypesData } = useGetAllBatteryTypesQuery();
  
  const {
    data: inventorySummary,
    isLoading: summaryLoading,
  } = useGetStaffInventorySummaryQuery(staffStationId);

  const {
    data: storageData,
    isLoading: storageLoading,
    refetch: refetchStorage,
  } = useGetBatteriesInStorageQuery({
    stationId: staffStationId,
    pageSize: 50,
    status: 'Available',
  });

  const {
    data: slotsData,
    isLoading: slotsLoading,
    refetch: refetchSlots,
  } = useGetBatterySlotsByStationQuery({
    stationId: staffStationId,
    pageSize: 50,
  });
  
  const [updateBatterySlot] = useUpdateBatterySlotMutation();

  const batteryTypes = batteryTypesData?.batteryTypes || [];
  const storageBatteries = storageData?.content || [];
  const batterySlots = slotsData?.content || [];

  const handleAssignBatteryToSlot = async (slotId, batteryId) => {
    try {
      const slot = batterySlots.find(s => s.slotId === slotId);
      await updateBatterySlot({
        slotId,
        stationId: staffStationId,
        slotNumber: slot.slotNumber,
        batteryId: batteryId,
        status: batteryId ? 'Full_slot' : 'Empty_slot',
        batteryTypeId: slot.batteryTypeId,
      }).unwrap();
      
      refetchSlots();
      refetchStorage();
      setShowAssignModal(false);
      setSelectedSlot(null);
      setSelectedBattery(null);
    } catch (error) {
      console.error('Error assigning battery to slot:', error);
      alert('Có lỗi khi gán pin vào slot!');
    }
  };

  const handleRemoveBatteryFromSlot = async (slotId) => {
    if (window.confirm('Bạn có chắc chắn muốn lấy pin ra khỏi slot này?')) {
      await handleAssignBatteryToSlot(slotId, null);
    }
  };

  const getSlotStatusColor = (status) => {
    switch (status) {
      case 'Full_slot':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Empty_slot':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBatteryStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Charging':
        return 'bg-yellow-100 text-yellow-800';
      case 'Maintenance':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Quản lý Pin Trạm
        </h1>
        <p className="text-gray-600">
          Quản lý pin trong kho và gán vào các slot tại trạm của bạn
        </p>
      </div>

      {/* Inventory Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <CpuChipIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {summaryLoading ? '...' : inventorySummary?.total || 0}
              </p>
              <p className="text-sm text-gray-600">Tổng số pin</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {summaryLoading ? '...' : inventorySummary?.available || 0}
              </p>
              <p className="text-sm text-gray-600">Pin có sẵn</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CpuChipIcon className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {summaryLoading ? '...' : inventorySummary?.charging || 0}
              </p>
              <p className="text-sm text-gray-600">Đang sạc</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {summaryLoading ? '...' : inventorySummary?.maintenance || 0}
              </p>
              <p className="text-sm text-gray-600">Bảo trì</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Lọc theo loại pin:
          </label>
          <select
            value={selectedBatteryType}
            onChange={(e) => setSelectedBatteryType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả loại pin</option>
            {batteryTypes.map((type) => (
              <option key={type.batteryTypeId} value={type.batteryTypeId}>
                {type.batteryTypeName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Battery Slots */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <RectangleGroupIcon className="w-5 h-5" />
              Slots Pin ({batterySlots.length})
            </h2>
          </div>

          <div className="p-6">
            {slotsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Đang tải slots...</p>
              </div>
            ) : batterySlots.length === 0 ? (
              <div className="text-center py-8">
                <RectangleGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Chưa có slots nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {batterySlots.map((slot) => (
                  <div
                    key={slot.slotId}
                    className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${getSlotStatusColor(slot.status)}`}
                    onClick={() => {
                      if (slot.status === 'Empty_slot') {
                        setSelectedSlot(slot);
                        setShowAssignModal(true);
                      }
                    }}
                  >
                    <div className="text-center">
                      <div className="text-lg font-semibold mb-2">
                        Slot {slot.slotNumber}
                      </div>
                      
                      {slot.status === 'Full_slot' && slot.batterySerial ? (
                        <div>
                          <CpuChipIcon className="w-8 h-8 mx-auto text-green-600 mb-2" />
                          <div className="text-sm font-medium">
                            Pin #{slot.batterySerial}
                          </div>
                          <div className="text-xs text-gray-600 mb-2">
                            {slot.batteryTypeName}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveBatteryFromSlot(slot.slotId);
                            }}
                            className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                          >
                            Lấy ra
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="w-8 h-8 mx-auto border-2 border-dashed border-gray-400 rounded mb-2 flex items-center justify-center">
                            <PlusIcon className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="text-sm text-gray-600">
                            Trống
                          </div>
                          <div className="text-xs text-gray-500">
                            {slot.batteryTypeName}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Storage Batteries */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CpuChipIcon className="w-5 h-5" />
              Pin trong kho ({storageBatteries.length})
            </h2>
          </div>

          <div className="p-6">
            {storageLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Đang tải pin...</p>
              </div>
            ) : storageBatteries.length === 0 ? (
              <div className="text-center py-8">
                <CpuChipIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Không có pin nào trong kho</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {storageBatteries.map((battery) => (
                  <div
                    key={battery.batteryId}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CpuChipIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Pin #{battery.serialNo}
                        </div>
                        <div className="text-sm text-gray-600">
                          {battery.batteryTypeName}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <BatteryStatusIndicator
                            currentCapacity={battery.currentCapacityWh || 0}
                            totalCapacity={battery.capacityWh || 100}
                            status={battery.status}
                            size="sm"
                          />
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBatteryStatusColor(battery.status)}`}>
                            {battery.status === 'Available' ? 'Có sẵn' : battery.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedBattery(battery);
                        setShowAssignModal(true);
                      }}
                      disabled={battery.status !== 'Available'}
                      className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <ArrowRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Gán Pin vào Slot
            </h3>
            
            {selectedSlot && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">Slot {selectedSlot.slotNumber}</div>
                <div className="text-sm text-gray-600">
                  Loại pin: {selectedSlot.batteryTypeName}
                </div>
              </div>
            )}

            {selectedBattery && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="font-medium">Pin #{selectedBattery.serialNo}</div>
                <div className="text-sm text-gray-600">
                  {selectedBattery.batteryTypeName} - {selectedBattery.soCPercent}%
                </div>
              </div>
            )}

            <div className="space-y-4">
              {selectedSlot && !selectedBattery && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn pin từ kho:
                  </label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {storageBatteries
                      .filter(battery => battery.status === 'Available' && 
                                        battery.batteryTypeId === selectedSlot.batteryTypeId)
                      .map((battery) => (
                        <button
                          key={battery.batteryId}
                          onClick={() => setSelectedBattery(battery)}
                          className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="font-medium">Pin #{battery.serialNo}</div>
                          <div className="text-sm text-gray-600">
                            {battery.batteryTypeName} - {battery.soCPercent}%
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedSlot(null);
                    setSelectedBattery(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    if (selectedSlot && selectedBattery) {
                      handleAssignBatteryToSlot(selectedSlot.slotId, selectedBattery.batteryId);
                    }
                  }}
                  disabled={!selectedSlot || !selectedBattery}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Gán pin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffBatteryManagement;