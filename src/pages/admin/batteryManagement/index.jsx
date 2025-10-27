import { useState } from 'react';
import BatteryFilters from '../../../components/battery/BatteryFilters';
import BatteryModal from '../../../components/battery/BatteryModal';
import BatteryPagination from '../../../components/battery/BatteryPagination';
import {
    BatteryEmptyState,
    BatteryErrorState,
    BatteryLoadingState,
} from '../../../components/battery/BatteryStates';
import BatteryTable from '../../../components/battery/BatteryTable';
import {
    useDeleteBatteryMutation,
    useGetAllBatteriesQuery,
    useUpdateBatteryMutation
} from '../../../services/battery.service.js';
import { useGetAllBatteryTypesQuery } from '../../../services/batteryType.service.js';
import { useGetStationsQuery } from '../../../services/station.service.js';

const AdminBatteryManagement = () => {
  const [selectedStation, setSelectedStation] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchSerial, setSearchSerial] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBattery, setSelectedBattery] = useState(null);

  const { data: stationsData } = useGetStationsQuery({ page: 1, pageSize: 100 });
  const { data: batteryTypesData } = useGetAllBatteryTypesQuery();
  
  const {
    data: batteriesData,
    isLoading: batteriesLoading,
    isError: batteriesError,
    refetch: refetchBatteries,
  } = useGetAllBatteriesQuery({
    page,
    pageSize: 20,
    ...(selectedStation !== 'all' && { stationId: selectedStation }),
    ...(selectedStatus !== 'all' && { status: selectedStatus }),
  });

  const [updateBattery] = useUpdateBatteryMutation();
  const [deleteBattery] = useDeleteBatteryMutation();

  const batteries = batteriesData?.content || [];
  const pagination = batteriesData?.pagination || {};
  const stations = stationsData?.content || stationsData?.data || [];

  const batteryStatuses = [
    { value: 'Available', label: 'Có sẵn', color: 'bg-green-100 text-green-800' },
    { value: 'InUse', label: 'Đang sử dụng', color: 'bg-blue-100 text-blue-800' },
    { value: 'Charging', label: 'Đang sạc', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Maintenance', label: 'Bảo trì', color: 'bg-orange-100 text-orange-800' },
    { value: 'Damaged', label: 'Hỏng', color: 'bg-red-100 text-red-800' },
  ];

  const getStatusInfo = (status) => {
    return batteryStatuses.find(s => s.value === status) || 
           { value: status, label: status, color: 'bg-gray-100 text-gray-800' };
  };

  const handleAssignToStation = async (batteryId, stationId) => {
    try {
      const battery = batteries.find(b => b.batteryId === batteryId);
      await updateBattery({
        batteryId,
        ...battery,
        stationId: stationId || null,
      }).unwrap();
      refetchBatteries();
    } catch (error) {
      console.error('Error assigning battery:', error);
    }
  };

  const handleStatusChange = async (batteryId, newStatus) => {
    try {
      const battery = batteries.find(b => b.batteryId === batteryId);
      await updateBattery({
        batteryId,
        ...battery,
        status: newStatus,
      }).unwrap();
      refetchBatteries();
    } catch (error) {
      console.error('Error updating battery status:', error);
    }
  };

  const handleDeleteBattery = async (batteryId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa pin này?')) {
      try {
        await deleteBattery(batteryId).unwrap();
        refetchBatteries();
      } catch (error) {
        console.error('Error deleting battery:', error);
      }
    }
  };

  const filteredBatteries = batteries.filter(battery => 
    !searchSerial || battery.serialNo.toString().includes(searchSerial)
  );

  const hasFilters = selectedStation !== 'all' || selectedStatus !== 'all' || searchSerial.trim() !== '';

  const clearFilters = () => {
    setSelectedStation('all');
    setSelectedStatus('all');
    setSearchSerial('');
    setPage(1);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Quản lý Pin
        </h1>
        <p className="text-gray-600">
          Quản lý tất cả pin trong hệ thống và phân bổ cho các trạm
        </p>
      </div>

      <BatteryFilters
        searchSerial={searchSerial}
        setSearchSerial={setSearchSerial}
        selectedStation={selectedStation}
        setSelectedStation={setSelectedStation}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        stations={stations}
        batteryStatuses={batteryStatuses}
        onAddBattery={() => setShowCreateModal(true)}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Danh sách Pin ({filteredBatteries.length})
          </h2>
        </div>

        {batteriesLoading ? (
          <BatteryLoadingState />
        ) : batteriesError ? (
          <BatteryErrorState onRetry={refetchBatteries} />
        ) : filteredBatteries.length === 0 ? (
          <BatteryEmptyState
            hasFilters={hasFilters}
            onAddBattery={() => setShowCreateModal(true)}
            onClearFilters={clearFilters}
          />
        ) : (
          <>
            <BatteryTable
              batteries={filteredBatteries}
              stations={stations}
              batteryStatuses={batteryStatuses}
              getStatusInfo={getStatusInfo}
              onAssignToStation={handleAssignToStation}
              onStatusChange={handleStatusChange}
              onEdit={(battery) => {
                setSelectedBattery(battery);
                setShowEditModal(true);
              }}
              onDelete={handleDeleteBattery}
            />

            <BatteryPagination
              page={page}
              setPage={setPage}
              pagination={pagination}
              pageSize={20}
            />
          </>
        )}
      </div>

      <BatteryModal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          setSelectedBattery(null);
        }}
        battery={selectedBattery}
        onSuccess={() => {
          refetchBatteries();
        }}
      />
    </div>
  );
};

export default AdminBatteryManagement;