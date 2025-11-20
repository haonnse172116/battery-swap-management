import { useState, useEffect } from 'react';
import { MapPinIcon, MapIcon } from "@heroicons/react/24/outline";
import { useGetStationsByBatteryTypeQuery } from '../../../../services/station.service';
import StationMap from './StationMap';

const StationSelection = ({
  selectedCar,
  selectedStation,
  setSelectedStation,
  nextStep,
  prevStep,
}) => {
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [excludeFull, setExcludeFull] = useState(true);

  const batteryTypeId = selectedCar?.batteryTypeId;
  const carInfo = `${selectedCar?.vBrand} ${selectedCar?.model}`;

  
  const mockStations = process.env.NODE_ENV === 'development' ? [
    {
      stationId: "mock-station-001",
      stationName: "Trạm Dev - Quận 1",
      address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      latitude: 10.7769,
      longitude: 106.7009,
      availableSlots: 3,
      totalSlots: 8,
      availableBatteriesOfType: 5,
      isFullForSwap: false
    },
    {
      stationId: "mock-station-002", 
      stationName: "Trạm Dev - Quận 3",
      address: "456 Võ Văn Tần, Quận 3, TP.HCM",
      latitude: 10.7829,
      longitude: 106.6934, 
      availableSlots: 2,
      totalSlots: 6,
      availableBatteriesOfType: 3,
      isFullForSwap: false
    },
    {
      stationId: "mock-station-003",
      stationName: "Trạm Dev - Quận 7", 
      address: "789 Nguyễn Thị Thập, Quận 7, TP.HCM",
      latitude: 10.7411,
      longitude: 106.6980,
      availableSlots: 0,
      totalSlots: 4,
      availableBatteriesOfType: 0,
      isFullForSwap: true 
    },
    {
      stationId: "mock-station-004",
      stationName: "Trạm Dev - Bình Thạnh",
      address: "321 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM", 
      latitude: 10.8018,
      longitude: 106.7139,
      availableSlots: 1,
      totalSlots: 5,
      availableBatteriesOfType: 2,
      isFullForSwap: false
    },
    {
      stationId: "mock-station-005",
      stationName: "Trạm Dev - Thủ Đức",
      address: "789 Võ Văn Ngân, Thủ Đức, TP.HCM",
      latitude: 10.8509,
      longitude: 106.7717,
      availableSlots: 4,
      totalSlots: 10,
      availableBatteriesOfType: 8,
      isFullForSwap: false
    }
  ] : [];

  
  const { 
    data: stationsData, 
    isLoading: stationsLoading, 
    isError: stationsError,
    error: stationsErrorData,
    refetch: refetchStations
  } = useGetStationsByBatteryTypeQuery(
    { 
      batteryTypeId, 
      excludeFull 
    },
    {
      skip: !batteryTypeId
    }
  );

  
  const stations = (() => {
    
    if (stationsData?.content?.length > 0) {
      return stationsData.content;
    }
    
    
    if (process.env.NODE_ENV === 'development') {
      
      return excludeFull 
        ? mockStations.filter(station => !station.isFullForSwap)
        : mockStations;
    }
    
    
    return [];
  })();

  
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
  };

  
  const getUserLocation = () => {
    setGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Trình duyệt không hỗ trợ định vị");
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setUserLocation(location);
        setGettingLocation(false);
      },
      (error) => {
        let errorMessage = "Không thể lấy vị trí";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Bạn đã từ chối quyền truy cập vị trí";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Thông tin vị trí không khả dụng";
            break;
          case error.TIMEOUT:
            errorMessage = "Yêu cầu vị trí bị timeout";
            break;
        }
        setLocationError(errorMessage);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 
      }
    );
  };

  
  const stationsWithDistance = stations.map(station => {
    let distance = null;
    if (userLocation && station.latitude && station.longitude) {
      distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        parseFloat(station.latitude),
        parseFloat(station.longitude)
      );
    }
    return {
      ...station,
      calculatedDistance: distance
    };
  }).sort((a, b) => {
    
    if (a.calculatedDistance !== null && b.calculatedDistance !== null) {
      return a.calculatedDistance - b.calculatedDistance;
    }
    if (a.calculatedDistance !== null) return -1;
    if (b.calculatedDistance !== null) return 1;
    return a.stationName.localeCompare(b.stationName);
  });

  
  const getStationStatus = (station) => {
    if (station.isFullForSwap) {
      return { text: 'Đã đầy', color: 'bg-red-100 text-red-700', icon: '🔴' };
    } else if (station.availableSlots === 0) {
      return { text: 'Hết chỗ', color: 'bg-orange-100 text-orange-700', icon: '⚠️' };
    } else if (station.availableBatteriesOfType === 0) {
      return { text: 'Hết pin', color: 'bg-yellow-100 text-yellow-700', icon: '🔋' };
    } else {
      return { text: 'Có sẵn', color: 'bg-green-100 text-green-700', icon: '🟢' };
    }
  };

  
  useEffect(() => {
    getUserLocation();
  }, []);

  return (
    <div>
      {process.env.NODE_ENV === 'development' && !stationsData?.content?.length && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">🛠️</span>
            <span className="text-sm font-medium text-blue-800">
              Development Mode: Sử dụng dữ liệu mock ({mockStations.length} trạm)
            </span>
          </div>
        </div>
      )}

      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          Chọn trạm thay pin
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Tìm trạm có sẵn loại pin{" "}
          <strong>{selectedCar?.batteryTypeName}</strong>
          {process.env.NODE_ENV === 'development' && !stationsData?.content?.length && (
            <span className="text-blue-600"> (Mock data)</span>
          )}
        </p>
      </div>

      {/* ✅ Location & Filter Controls */}
      <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
        {/* First Row: Location Status & Map Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Location Status */}
          <div className="flex-1 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <MapPinIcon className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Vị trí của bạn</span>
            </div>
            
            {gettingLocation && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-600">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                <span>Đang lấy vị trí...</span>
              </div>
            )}
            
            {locationError && (
              <div className="text-xs sm:text-sm text-red-600 mb-2">
                ❌ {locationError}
              </div>
            )}
            
            {userLocation && (
              <div className="text-xs sm:text-sm text-green-600">
                ✅ Đã xác định vị trí (±{Math.round(userLocation.accuracy)}m)
              </div>
            )}
            
            <button
              onClick={getUserLocation}
              disabled={gettingLocation}
              className="mt-2 text-xs sm:text-sm text-blue-600 hover:underline disabled:opacity-50"
            >
              🔄 Cập nhật vị trí
            </button>
          </div>

          {/* Map Toggle Button */}
          <button
            onClick={() => setShowMap(!showMap)}
            className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <MapIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            {showMap ? 'Ẩn bản đồ' : 'Xem bản đồ'}
          </button>
        </div>

        {/* Second Row: Filter Options */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Exclude Full Stations Toggle */}
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <input
              type="checkbox"
              id="excludeFull"
              checked={excludeFull}
              onChange={(e) => setExcludeFull(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="excludeFull" className="text-sm font-medium text-gray-700 cursor-pointer">
              🚫 Ẩn trạm đã đầy
            </label>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => refetchStations()}
            disabled={stationsLoading}
            className="px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${stationsLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </button>
        </div>
      </div>

      {/* ✅ Map Component (Optional) */}
      {showMap && (
        <div className="mb-4 sm:mb-6 h-80 sm:h-96 rounded-lg overflow-hidden border border-gray-200">
          <StationMap
            stations={stationsWithDistance}
            userLocation={userLocation}
            selectedStation={selectedStation}
            onStationSelect={setSelectedStation}
          />
        </div>
      )}

      {/* ✅ Loading State - Only for real API calls */}
      {stationsLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">
              Đang tìm trạm có sẵn pin {selectedCar?.batteryTypeName}...
            </p>
          </div>
        </div>
      )}

      {/* ✅ Error State - Only for real API calls */}
      {stationsError && !stations.length && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-red-700 mb-2 text-sm sm:text-base">
            ❌ Không thể tải danh sách trạm: {stationsErrorData?.data?.message || 'Lỗi không xác định'}
          </p>
          <div className="space-x-2">
            <button
              onClick={() => refetchStations()}
              className="text-sm text-blue-600 hover:underline"
            >
              Thử lại
            </button>
            <span className="text-gray-400">|</span>
            <button
              onClick={() => setExcludeFull(!excludeFull)}
              className="text-sm text-blue-600 hover:underline"
            >
              {excludeFull ? 'Hiện tất cả trạm' : 'Chỉ trạm có chỗ'}
            </button>
          </div>
        </div>
      )}

      {/* ✅ Empty State - Only when no mock data either */}
      {!stationsLoading && !stationsError && stations.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center mb-6">
          <MapPinIcon className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Không có trạm phù hợp
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {excludeFull 
              ? `Hiện tại không có trạm nào có chỗ trống cho pin ${selectedCar?.batteryTypeName} trong khu vực.`
              : `Không tìm thấy trạm nào hỗ trợ pin ${selectedCar?.batteryTypeName}.`
            }
          </p>
          {excludeFull && (
            <button
              onClick={() => setExcludeFull(false)}
              className="text-sm text-blue-600 hover:underline"
            >
              🔍 Xem tất cả trạm (kể cả đầy)
            </button>
          )}
        </div>
      )}

      {/* ✅ Station List */}
      {!stationsLoading && stationsWithDistance.length > 0 && (
        <ul className="space-y-3 sm:space-y-4 mb-6">
          {stationsWithDistance.map((station, index) => {
            const stationStatus = getStationStatus(station);
            return (
              <li
                key={station.stationId}
                onClick={() => setSelectedStation(station)}
                className={`flex items-start sm:items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border cursor-pointer transition ${
                  selectedStation?.stationId === station.stationId
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/40"
                }`}
              >
                <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                  {/* Rank Badge */}
                  {userLocation && station.calculatedDistance !== null && index < 3 && (
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0
                      ${index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-orange-500'}
                    `}>
                      {index + 1}
                    </div>
                  )}
                  
                  <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-800 text-sm sm:text-base">
                        {station.stationName}
                        {/* Mock data indicator */}
                        {process.env.NODE_ENV === 'development' && !stationsData?.content?.length && (
                          <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                            Mock
                          </span>
                        )}
                      </p>
                      {index === 0 && userLocation && station.calculatedDistance !== null && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          Gần nhất
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 truncate mb-1">
                      {station.address}
                    </p>
                    
                    {/* Station Status & Availability */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${stationStatus.color}`}>
                        {stationStatus.icon} {stationStatus.text}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1 ml-2">
                  {/* Distance */}
                  {station.calculatedDistance !== null ? (
                    <span className="text-xs sm:text-sm text-gray-500 font-medium">
                      📍 {station.calculatedDistance.toFixed(1)}km
                    </span>
                  ) : (
                    <span className="text-xs sm:text-sm text-gray-400">
                      📍 --km
                    </span>
                  )}
                  
                  {/* Selected Indicator */}
                  {selectedStation?.stationId === station.stationId && (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* ✅ Navigation Buttons - Always show return button */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        {/* ✅ Return button always visible */}
        <button
          onClick={prevStep}
          className="order-2 sm:order-1 px-4 sm:px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition text-sm sm:text-base"
        >
          ← Quay lại
        </button>
        
        {/* ✅ Next button conditional */}
        {selectedStation ? (
          <button
            onClick={nextStep}
            className="order-1 sm:order-2 px-4 sm:px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <span>Tiếp tục</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <div className="order-1 sm:order-2 px-4 sm:px-6 py-2 rounded-lg bg-gray-300 text-gray-500 text-center text-sm sm:text-base cursor-not-allowed">
            Chọn trạm để tiếp tục
          </div>
        )}
      </div>
    </div>
  );
};

export default StationSelection;
