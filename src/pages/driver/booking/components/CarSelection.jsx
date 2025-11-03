import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useGetMyVehiclesQuery } from '../../../../services/vehicle.service';
import { TruckIcon } from '@heroicons/react/24/outline';
import CarIcon from '../../../../constant/svg/Car';

const CarSelection = ({ selectedCar, setSelectedCar, nextStep }) => {
  const currentUser = useSelector((state) => state.auth.user);
  
  const { 
    data: vehiclesData, 
    isLoading, 
    isError, 
    error 
  } = useGetMyVehiclesQuery();

  const vehicles = useMemo(() => {
    const allVehicles = vehiclesData?.content || [];
    return allVehicles.filter(car => car.batteryId); 
  }, [vehiclesData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Đang tải danh sách xe...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
        <p className="text-red-700 mb-4 text-sm sm:text-base">
          ❌ Không thể tải danh sách xe: {error?.data?.message || 'Lỗi không xác định'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm sm:text-base text-blue-600 hover:underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // ✅ Updated empty state message
  if (vehicles.length === 0) {
    const totalVehicles = vehiclesData?.content?.length || 0;
    const vehiclesWithoutBattery = totalVehicles - vehicles.length;
    
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 sm:p-8 text-center">
        <TruckIcon className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-600 mx-auto mb-4" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
          Không có xe nào sẵn sàng để swap pin
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          {totalVehicles === 0 
            ? "Bạn chưa có xe nào. Thêm xe và gắn pin để bắt đầu swap."
            : `Bạn có ${totalVehicles} xe nhưng ${vehiclesWithoutBattery} xe chưa có pin. Cần gắn pin trước khi swap.`
          }
        </p>
        <button
          onClick={() => window.location.href = '/driver/mycar'}
          className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
        >
          {totalVehicles === 0 ? "Thêm xe ngay" : "Quản lý xe"}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Chọn xe của bạn</h2>
        <p className="text-sm sm:text-base text-gray-600">
          Chọn xe cần thay pin để tiếp tục ({vehicles.length} xe sẵn sàng)
        </p>
      </div>

      {/* Vehicle List - chỉ xe có pin */}
      <div className="space-y-3 sm:space-y-4">
        {vehicles.map((car) => (
          <div
            key={car.vehicleId}
            onClick={() => setSelectedCar(car)}
            className={`relative flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              selectedCar?.vehicleId === car.vehicleId
                ? "border-blue-500 bg-blue-50 shadow-md scale-[1.01] sm:scale-[1.02]"
                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-sm"
            }`}
          >
            {/* Selected Indicator */}
            {selectedCar?.vehicleId === car.vehicleId && (
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}

            {/* ✅ Car Icon - chỉ xe có pin */}
            <div className="flex-shrink-0">
              <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-lg flex items-center justify-center bg-green-50 border-2 border-green-200">
                <div className="text-center">
                  <CarIcon className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1 text-green-600" />
                </div>
              </div>
            </div>

            {/* Car Info */}
            <div className="flex-1 min-w-0">
              {/* Name & License */}
              <div className="mb-2 sm:mb-3">
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1">
                  {car.vBrand} {car.model}
                </h3>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 flex-wrap">
                  <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                    {car.licensePlate}
                  </span>
                  <span className="text-gray-500 hidden sm:inline">• {car.vBrand}</span>
                </div>
              </div>

              {/* Battery Type & Current Battery */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {car.batteryTypeName && (
                  <div className="flex items-center gap-1.5 bg-purple-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
                    <span className="text-xs sm:text-sm font-medium text-purple-700">
                      🔋 {car.batteryTypeName}
                    </span>
                  </div>
                )}

                {/* ✅ Luôn có batteryId vì đã filter */}
                <div className="flex items-center gap-1.5 bg-gray-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
                  <span className="text-xs text-gray-600">
                    Pin: <span className="font-mono font-medium">{car.batteryId.slice(0, 6)}...</span>
                  </span>
                </div>

                {/* User Name (for debugging) - Hidden on mobile */}
                {car.userName && (
                  <div className="hidden sm:flex items-center gap-1.5 bg-green-100 px-3 py-1.5 rounded-lg">
                    <span className="text-xs text-green-700">
                      👤 {car.userName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="mt-4 sm:mt-6">
        {selectedCar ? (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl border border-blue-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Xe đã chọn:</p>
                <p className="font-semibold text-gray-900 text-base sm:text-lg">
                  {selectedCar.vBrand} {selectedCar.model}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  <span className="font-mono">{selectedCar.licensePlate}</span>
                </p>
                {selectedCar.batteryTypeName && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Loại pin: <span className="font-medium text-purple-700">{selectedCar.batteryTypeName}</span>
                  </p>
                )}
                <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">
                  Pin hiện tại: <span className="font-mono text-gray-800">{selectedCar.batteryId.slice(0, 12)}...</span>
                </p>
              </div>

              <button
                onClick={nextStep}
                className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <span>Tiếp tục</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 text-center">
            <p className="text-gray-500 text-sm sm:text-base mb-3">
              📝 Chọn một xe để tiếp tục đặt lịch thay pin
            </p>
            <div className="w-full px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-gray-300 text-gray-500 text-sm sm:text-base cursor-not-allowed">
              Tiếp tục
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarSelection;
