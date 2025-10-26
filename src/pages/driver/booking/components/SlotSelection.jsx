import { useState } from 'react';
import { useGetStationSlotsQuery } from '../../../../services/stationBatterySlot.service';

const SlotSelection = ({ 
  selectedCar,          
  selectedStation,       
  selectedSlot, 
  setSelectedSlot, 
  nextStep, 
  prevStep 
}) => {
  console.log("SlotSelection received station:", selectedStation);

  const stationId = selectedStation?.stationId;

  // ✅ Simplified mock slots - only available slots, no battery level
  const mockSlots = process.env.NODE_ENV === 'development' ? [
    {
      stationSlotId: "mock-slot-001",
      stationId: stationId,
      slotNo: "01",
      status: "Available",
      batteryId: "BAT-001-VF8-2024",
      lastUpdated: new Date().toISOString(),
      batteryType: selectedCar?.batteryTypeName || "VinFast VF8"
    },
    {
      stationSlotId: "mock-slot-002",
      stationId: stationId,
      slotNo: "02",
      status: "Available",
      batteryId: "BAT-002-VF8-2024",
      lastUpdated: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      batteryType: selectedCar?.batteryTypeName || "VinFast VF8"
    },
    {
      stationSlotId: "mock-slot-003",
      stationId: stationId,
      slotNo: "03",
      status: "Available",
      batteryId: "BAT-003-VF8-2024",
      lastUpdated: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      batteryType: selectedCar?.batteryTypeName || "VinFast VF8"
    },
    {
      stationSlotId: "mock-slot-007",
      stationId: stationId,
      slotNo: "07",
      status: "Available",
      batteryId: "BAT-007-VF8-2024",
      lastUpdated: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      batteryType: selectedCar?.batteryTypeName || "VinFast VF8"
    },
    {
      stationSlotId: "mock-slot-008",
      stationId: stationId,
      slotNo: "08",
      status: "Available",
      batteryId: "BAT-008-VF8-2024",
      lastUpdated: new Date().toISOString(),
      batteryType: selectedCar?.batteryTypeName || "VinFast VF8"
    }
  ] : [];

  const { 
    data: slotsData, 
    isLoading: slotsLoading, 
    isError: slotsError,
    error: slotsErrorData,
    refetch: refetchSlots
  } = useGetStationSlotsQuery(stationId, {
    skip: !stationId,
    pollingInterval: 30000, 
  });

  // ✅ Use real data if available, otherwise use mock data in development
  const slots = (() => {
    if (slotsData?.content?.length > 0) {
      return slotsData.content;
    }
    
    if (process.env.NODE_ENV === 'development') {
      return mockSlots;
    }
    
    return [];
  })();

  // ✅ All slots are available (BE only returns available slots)
  const availableSlots = slots;

  console.log("Available slots:", { 
    realData: slotsData?.content, 
    mockData: mockSlots, 
    finalSlots: slots,
    availableCount: availableSlots.length,
    isDev: process.env.NODE_ENV === 'development'
  });

  const handleSlotSelect = (slot) => {
    console.log("Selected slot for booking:", slot);
    
    setSelectedSlot({
      ...slot,
      selectedAt: new Date().toISOString()
    });
  };

  // ✅ Simplified status display - only for Available slots
  const getSlotStatusDisplay = () => {
    return { text: 'Có sẵn', color: 'bg-green-100 text-green-700', icon: '✅' };
  };

  return (
    <div>
      {/* ✅ Development Mode Indicator */}
      {process.env.NODE_ENV === 'development' && !slotsData?.content?.length && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">🛠️</span>
            <span className="text-sm font-medium text-blue-800">
              Development Mode: Sử dụng dữ liệu mock ({mockSlots.length} slot có sẵn)
            </span>
          </div>
        </div>
      )}



      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Chọn vị trí thay pin</h2>
        <p className="text-sm sm:text-base text-gray-600">
          Chọn slot phù hợp tại <strong>{selectedStation?.stationName}</strong>
          {process.env.NODE_ENV === 'development' && !slotsData?.content?.length && (
            <span className="text-blue-600"> (Mock data)</span>
          )}
        </p>
      </div>

      {/* Refresh Button */}
      <div className="mb-4 sm:mb-6 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {slots.length > 0 && (
            <span>
              Có sẵn: <strong className="text-green-600">{availableSlots.length}</strong> slot
            </span>
          )}
        </p>
        <button
          onClick={() => refetchSlots()}
          disabled={slotsLoading}
          className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm disabled:opacity-50 flex items-center gap-2"
        >
          <svg className={`w-4 h-4 ${slotsLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Làm mới
        </button>
      </div>

      {/* Loading State */}
      {slotsLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Đang tải danh sách slot...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {slotsError && !slots.length && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-red-700 mb-2 text-sm sm:text-base">
            ❌ Không thể tải danh sách slot: {slotsErrorData?.data?.message || 'Lỗi không xác định'}
          </p>
          <button
            onClick={() => refetchSlots()}
            className="text-sm text-blue-600 hover:underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Empty State */}
      {!slotsLoading && !slotsError && slots.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center mb-6">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔌</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có slot nào</h3>
          <p className="text-sm text-gray-600">Trạm này hiện tại không có slot nào khả dụng.</p>
        </div>
      )}

      {/* ✅ Simplified Slots Grid - Only Available Slots */}
      {!slotsLoading && slots.length > 0 && (
        <div className="mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-green-700 mb-4">
            🟢 Slot có sẵn ({availableSlots.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {availableSlots.map(slot => {
              const statusDisplay = getSlotStatusDisplay();
              const isSelected = selectedSlot?.stationSlotId === slot.stationSlotId;
              
              return (
                <div
                  key={slot.stationSlotId}
                  onClick={() => handleSlotSelect(slot)}
                  className={`relative p-4 sm:p-6 rounded-xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-green-400 hover:bg-green-50 hover:shadow-md"
                  }`}
                >
                  {/* Slot Number */}
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
                      {slot.slotNo}
                      {/* Mock data indicator */}
                      {process.env.NODE_ENV === 'development' && !slotsData?.content?.length && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                          Mock
                        </span>
                      )}
                    </div>
                    
                    {/* Status Badge */}
                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${statusDisplay.color}`}>
                      {statusDisplay.icon} {statusDisplay.text}
                    </span>
                    
                    {/* Battery Info */}
                    {slot.batteryId && (
                      <p className="text-xs text-gray-500 mt-3 font-mono">
                        Pin: {slot.batteryId.slice(0, 12)}...
                      </p>
                    )}
                    
                    {/* ✅ Safe Last Updated display */}
                    <p className="text-xs text-gray-400 mt-2">
                      {(() => {
                        try {
                          const lastUpdatedDate = new Date(slot.lastUpdated);
                          if (isNaN(lastUpdatedDate.getTime())) {
                            return 'Cập nhật gần đây';
                          }
                          return lastUpdatedDate.toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                        } catch (error) {
                          return 'Cập nhật gần đây';
                        }
                      })()}
                    </p>
                  </div>
                  
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ✅ Selected Slot Summary - Simplified */}
      {selectedSlot && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-800 mb-2 text-sm sm:text-base">
            🔌 Slot đã chọn
          </h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 text-sm sm:text-base">
                <span className="font-bold text-lg">Slot {selectedSlot.slotNo}</span>
              </p>
              {selectedSlot.batteryId && (
                <p className="text-xs text-purple-600 font-mono mt-1">
                  Pin ID: {selectedSlot.batteryId}
                </p>
              )}
              {selectedSlot.stationSlotId && (
                <p className="text-xs text-purple-500 mt-1 font-mono">
                  Slot ID: {selectedSlot.stationSlotId}
                </p>
              )}
              {selectedSlot.selectedAt && (
                <p className="text-xs text-purple-500 mt-1">
                  Chọn lúc: {new Date(selectedSlot.selectedAt).toLocaleTimeString('vi-VN')}
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                ✅ Đã chọn
              </span>
              {process.env.NODE_ENV === 'development' && !slotsData?.content?.length && (
                <div className="mt-1">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                    Mock
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <button
          onClick={prevStep}
          className="order-2 sm:order-1 px-4 sm:px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition text-sm sm:text-base"
        >
          ← Quay lại
        </button>
        
        {selectedSlot ? (
          <button
            onClick={nextStep}
            className="order-1 sm:order-2 px-4 sm:px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <span>Tiếp tục đặt chỗ</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <div className="order-1 sm:order-2 px-4 sm:px-6 py-2 rounded-lg bg-gray-300 text-gray-500 text-center text-sm sm:text-base cursor-not-allowed">
            Chọn slot để tiếp tục
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotSelection;
