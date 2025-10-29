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

  const stationId = selectedStation?.stationId;

  // 🚧 TEMPORARY MOCK DATA - REMOVE WHEN API IS FIXED
  const MOCK_ENABLED = true; // ⚠️ Set to false to use real API
  
  const mockSlots = [
    {
      stationSlotId: "slot-001",
      slotNo: "A1",
      status: "Available",
      batteryId: "BAT-ABC123DEF456GHI789",
      batteryLevel: 95,
      batteryType: "VinFast VF8 80kWh"
    },
    {
      stationSlotId: "slot-002", 
      slotNo: "A2",
      status: "Available",
      batteryId: "BAT-XYZ789ABC123DEF456",
      batteryLevel: 87,
      batteryType: "VinFast VF8 80kWh"
    },
    {
      stationSlotId: "slot-003",
      slotNo: "A3", 
      status: "Available",
      batteryId: "BAT-QWE456RTY789UIO123",
      batteryLevel: 76,
      batteryType: "VinFast VF8 80kWh"
    },
    {
      stationSlotId: "slot-004",
      slotNo: "B1",
      status: "Available",
      batteryId: "BAT-ASD123FGH456JKL789",
      batteryLevel: 45,
      batteryType: "VinFast VF9 90kWh"
    },
    {
      stationSlotId: "slot-005",
      slotNo: "B2",
      status: "Available",
      batteryId: null,
      batteryLevel: 0,
      batteryType: null
    },
    {
      stationSlotId: "slot-006",
      slotNo: "B3",
      status: "Available", 
      batteryId: "BAT-ZXC789VBN123NML456",
      batteryLevel: 23,
      batteryType: "VinFast VF9 90kWh"
    },
    {
      stationSlotId: "slot-007",
      slotNo: "C1",
      status: "Occupied", // This won't show in available slots
      batteryId: "BAT-POI987LKJ654MNB321",
      batteryLevel: 15,
      batteryType: "VinFast VF8 80kWh"
    }
  ];

  // ✅ Real API call - skip when using mock
  const { 
    data: slotsData, 
    isLoading: slotsLoading, 
    isError: slotsError,
    error: slotsErrorData,
    refetch: refetchSlots
  } = useGetStationSlotsQuery(stationId, {
    skip: !stationId || MOCK_ENABLED, // Skip API call when using mock
    pollingInterval: 30000,
  });

  // 🚧 Use mock data or real data
  const slots = MOCK_ENABLED ? mockSlots : (slotsData?.content || slotsData || []);
  const isLoading = MOCK_ENABLED ? false : slotsLoading;
  const isError = MOCK_ENABLED ? false : slotsError;
  const errorData = MOCK_ENABLED ? null : slotsErrorData;
  
  // ✅ Only show available slots
  const availableSlots = slots.filter(slot => 
    slot.status === "Available" || slot.status === "AVAILABLE"
  );



  const handleSlotSelect = (slot) => {
    
    setSelectedSlot({
      ...slot,
      selectedAt: new Date().toISOString()
    });
  };

  // 🚧 Mock refetch function
  const handleRefetch = () => {
    if (MOCK_ENABLED) {
      console.log("🚧 Mock refetch - no actual API call");
      return;
    }
    refetchSlots();
  };

  const getBatteryLevelColor = (level) => {
    if (level >= 80) return 'text-green-600';
    if (level >= 50) return 'text-yellow-600';
    if (level >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getBatteryLevelIcon = (level) => {
    if (level >= 80) return '🔋';
    if (level >= 50) return '🔋';
    if (level >= 20) return '🪫';
    return '🪫';
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 🚧 Mock indicator */}
      {MOCK_ENABLED && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-center">
          <span className="text-yellow-700 text-sm font-medium">
            🚧 Đang sử dụng dữ liệu giả để test UI - API đang bị lỗi
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Chọn vị trí thay pin</h2>
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-lg">{selectedStation?.stationName}</span>
        </div>
        <p className="text-gray-500 mt-2">Chọn vị trí vật lý để thực hiện thay pin</p>
      </div>

      {/* Stats & Refresh */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{availableSlots.length}</div>
              <div className="text-sm text-gray-500">Vị trí có sẵn</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{slots.length}</div>
              <div className="text-sm text-gray-500">Tổng vị trí</div>
            </div>
          </div>
          <button
            onClick={handleRefetch}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm font-medium">Làm mới</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Đang tải vị trí thay pin...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Không thể tải vị trí thay pin</h3>
          <p className="text-red-600 mb-4">
            {errorData?.data?.message || errorData?.message || 'Lỗi kết nối API'}
          </p>
          <button
            onClick={handleRefetch}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* No Available Slots */}
      {!isLoading && !isError && availableSlots.length === 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔌</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Không có vị trí nào khả dụng</h3>
          <p className="text-gray-600 mb-6">
            {slots.length > 0 
              ? `Trạm này có ${slots.length} vị trí nhưng hiện tại tất cả đều đang được sử dụng.`
              : 'Trạm này hiện tại chưa có vị trí thay pin nào.'
            }
          </p>
          <button
            onClick={handleRefetch}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Kiểm tra lại
          </button>
        </div>
      )}

      {/* ✅ Available Slots Grid */}
      {!isLoading && availableSlots.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h3 className="text-xl font-semibold text-gray-800">
              Vị trí có sẵn ({availableSlots.length})
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {availableSlots.map(slot => {
              const isSelected = selectedSlot?.stationSlotId === slot.stationSlotId;
              const batteryLevel = slot.batteryLevel || 0;
              
              return (
                <div
                  key={slot.stationSlotId}
                  onClick={() => handleSlotSelect(slot)}
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-xl ring-4 ring-blue-200"
                      : "border-gray-200 bg-white hover:border-green-400 hover:bg-green-50 hover:shadow-lg"
                  }`}
                >
                  {/* Slot Number */}
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 text-white rounded-2xl mb-3 shadow-lg">
                      <span className="text-2xl font-bold">{slot.slotNo}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-500">Vị trí #{slot.slotNo}</div>
                  </div>

                  {/* Battery Info */}
                  {slot.batteryId ? (
                    <div className="space-y-3">
                      {/* Battery ID */}
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 mb-1">ID Pin</div>
                        <div className="font-mono text-sm font-medium text-gray-800">
                          {slot.batteryId.slice(0, 12)}...
                        </div>
                      </div>

                      {/* Battery Level */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">Mức pin</span>
                          <span className={`text-sm font-bold ${getBatteryLevelColor(batteryLevel)}`}>
                            {batteryLevel}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              batteryLevel >= 80 ? 'bg-green-500' :
                              batteryLevel >= 50 ? 'bg-yellow-500' :
                              batteryLevel >= 20 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${batteryLevel}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Battery Type */}
                      {slot.batteryType && (
                        <div className="text-center">
                          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                            {slot.batteryType}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl">🔌</span>
                      </div>
                      <div className="text-sm text-gray-500">Chưa có pin</div>
                    </div>
                  )}

                  {/* Available Badge */}
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Sẵn sàng
                    </span>
                  </div>
                  
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
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

      {/* ✅ Selected Slot Summary */}
      {selectedSlot && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">{selectedSlot.slotNo}</span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-1">
                  Vị trí #{selectedSlot.slotNo} đã được chọn
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  {selectedSlot.batteryId && (
                    <p>📱 Pin ID: <span className="font-mono">{selectedSlot.batteryId}</span></p>
                  )}
                  {selectedSlot.batteryLevel !== undefined && (
                    <p>🔋 Mức pin: <span className="font-semibold">{selectedSlot.batteryLevel}%</span></p>
                  )}
                  <p>🏢 Trạm: <span className="font-medium">{selectedStation?.stationName}</span></p>
                </div>
              </div>
            </div>
            <span className="flex items-center gap-2 px-4 py-2 bg-white/80 text-blue-700 text-sm font-medium rounded-xl border border-blue-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Đã chọn
            </span>
          </div>
        </div>
      )}

      {/* ✅ Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <button
          onClick={prevStep}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition font-medium"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại chọn trạm
        </button>
        
        {selectedSlot ? (
          <button
            onClick={nextStep}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition font-medium shadow-lg hover:shadow-xl"
          >
            <span>Tiếp tục đặt chỗ</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-300 text-gray-500 font-medium cursor-not-allowed">
            <span>Chọn vị trí để tiếp tục</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotSelection;
