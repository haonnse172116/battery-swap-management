import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useGetAllVehiclesQuery } from '../../../../services/vehicle.service';
import { TruckIcon } from '@heroicons/react/24/outline';

const CarSelection = ({ selectedCar, setSelectedCar, nextStep }) => {
  const currentUser = useSelector((state) => state.auth.user);
  
  // ✅ Tạm dùng getAllVehicles, filter by userId
  const { 
    data: vehiclesData, 
    isLoading, 
    isError, 
    error 
  } = useGetAllVehiclesQuery({ pageSize: 100 });

  // ✅ Filter vehicles của current user
  const vehicles = useMemo(() => {
    if (!vehiclesData?.vehicles) return [];
    return vehiclesData.vehicles.filter(
      vehicle => vehicle.userId === currentUser?.userId
    );
  }, [vehiclesData, currentUser]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách xe...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 mb-4">
          ❌ Không thể tải danh sách xe: {error?.data?.message || 'Lỗi không xác định'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-blue-600 hover:underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // Handle empty state
  if (vehicles.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <TruckIcon className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Chưa có xe nào
        </h3>
        <p className="text-gray-600 mb-4">
          Bạn cần thêm xe trước khi đặt lịch swap pin
        </p>
        <button
          onClick={() => window.location.href = '/driver/mycar'}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Thêm xe ngay
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Chọn xe của bạn</h2>
        <p className="text-gray-600">Chọn xe cần thay pin để tiếp tục</p>
      </div>

      {/* Vehicle List */}
      <div className="space-y-4">
        {vehicles.map((car) => (
          <div
            key={car.vehicleId}
            onClick={() => setSelectedCar(car)}
            className={`relative flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              selectedCar?.vehicleId === car.vehicleId
                ? "border-blue-500 bg-blue-50 shadow-md scale-[1.02]"
                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-sm"
            }`}
          >
            {/* Selected Indicator */}
            {selectedCar?.vehicleId === car.vehicleId && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}

            {/* Car Image */}
            <img
              src={car.image}
              alt={car.name}
              className="w-24 h-20 rounded-lg object-cover flex-shrink-0 bg-gray-100"
              onError={(e) => {
                e.target.src = '/vf8.png';
              }}
            />

            {/* Car Info */}
            <div className="flex-1 min-w-0">
              {/* Name & License */}
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 text-lg mb-1">
                  {car.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                  <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                    {car.licensePlate}
                  </span>
                  {car.brand && (
                    <span className="text-gray-500">• {car.brand}</span>
                  )}
                </div>
              </div>

              {/* Battery Type & Current Battery */}
              <div className="flex items-center gap-3 flex-wrap">
                {car.batteryType && (
                  <div className="flex items-center gap-1.5 bg-purple-100 px-3 py-1.5 rounded-lg">
                    <span className="text-sm font-medium text-purple-700">
                      🔋 {car.batteryType}
                    </span>
                  </div>
                )}

                {car.batteryId && (
                  <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg">
                    <span className="text-xs text-gray-600">
                      Pin hiện tại: <span className="font-mono font-medium">{car.batteryId.slice(0, 8)}...</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Car Summary */}
      {selectedCar && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Xe đã chọn:</p>
              <p className="font-semibold text-gray-900 text-lg">
                {selectedCar.name}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-mono">{selectedCar.licensePlate}</span>
              </p>
              {selectedCar.batteryType && (
                <p className="text-sm text-gray-600 mt-1">
                  Loại pin: <span className="font-medium text-purple-700">{selectedCar.batteryType}</span>
                </p>
              )}
            </div>

            <button
              onClick={nextStep}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <span>Tiếp tục</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarSelection;
