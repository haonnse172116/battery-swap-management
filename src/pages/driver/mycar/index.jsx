import { useState } from "react";
import {
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useGetMyVehiclesQuery,
} from "../../../services/vehicle.service";
import { useAttachBatteryMutation } from "../../../services/battery.service";
import {
  PlusIcon,
  PencilSquareIcon,
  Battery100Icon,
} from "@heroicons/react/24/outline";
import CarModal from "./components/CarModal";
import toast from "../../../utils/toast";
import CarIcon from "../../../constant/svg/Car";


const MyCar = () => {
  const { data: vehiclesData, isLoading, refetch } = useGetMyVehiclesQuery();
  const cars = vehiclesData?.content || [];

  // ✅ Mutations
  const [createVehicle, { isLoading: isCreating }] = useCreateVehicleMutation();
  const [updateVehicle, { isLoading: isUpdating }] = useUpdateVehicleMutation();
  const [attachBattery, { isLoading: isAttaching }] = useAttachBatteryMutation();

  // ✅ Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);

  // ✅ Handlers
  const handleOpenAdd = () => {
    setEditingCar(null);
    setShowModal(true);
  };

  const handleOpenEdit = (car) => {
    setEditingCar(car);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCar(null);
  };

  // ✅ Handle save vehicle (battery type required for creation)
  const handleSave = async (formData) => {
    const loadingToastId = toast.loading(
      editingCar ? "Đang cập nhật xe..." : "Đang thêm xe..."
    );

    try {
      if (editingCar) {
        // ✅ Update existing vehicle
        const updateData = {
          vBrand: formData.vBrand,
          model: formData.model,
          licensePlate: formData.licensePlate,
        };

        await updateVehicle({
          vehicleId: editingCar.vehicleId,
          ...updateData,
        }).unwrap();

        toast.dismiss(loadingToastId);
        toast.success(`Cập nhật xe ${formData.licensePlate} thành công!`);
      } else {
        // ✅ Create new vehicle (battery type required)
        const createData = {
          vBrand: formData.vBrand,
          model: formData.model,
          licensePlate: formData.licensePlate,
          batteryTypeId: formData.batteryTypeId, // Required for creation
        };

        await createVehicle(createData).unwrap();

        toast.dismiss(loadingToastId);
        toast.success(
          `Thêm xe ${formData.licensePlate} thành công! Giờ bạn có thể gắn pin tương ứng.`
        );
      }

      setShowModal(false);
      refetch();
    } catch (err) {
      console.error("Save vehicle error:", err);
      toast.dismiss(loadingToastId);
      toast.error(err.data?.message || "Có lỗi xảy ra khi lưu xe");
    }
  };

  const handleAttachBattery = async ({
    vehicleId,
    batteryId,
    performByUserId,
  }) => {
    const loadingToastId = toast.loading("Đang gắn pin...");

    try {
      await attachBattery({
        vehicleId,
        batteryId,
        performByUserId,
      }).unwrap();

      toast.dismiss(loadingToastId);
      toast.success(`🔗 Gắn pin thành công!`);

      setShowModal(false);
      refetch();
    } catch (err) {
      console.error("Attach battery error:", err);
      toast.dismiss(loadingToastId);
      toast.error(err.data?.message || "Có lỗi xảy ra khi gắn pin");
    }
  };

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

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Xe của tôi
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý danh sách xe và pin của bạn ({cars.length} xe)
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Thêm xe</span>
        </button>
      </div>

      {cars.length > 0 ? (
        <div className="grid gap-4">
          {cars.map((car) => (
            <div
              key={car.vehicleId}
              className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      car.batteryId
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                      <CarIcon className="w-6 h-6" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {car.vBrand} {car.model}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">
                          {car.licensePlate}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {car.batteryTypeName && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            🔋 {car.batteryTypeName}
                          </span>
                        )}
                        {car.batteryId ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Pin: {car.batteryId.slice(0, 8)}...
                          </span>
                        ) : (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                            ⚠️ Chưa có pin
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleOpenEdit(car)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50 transition border border-blue-200 hover:border-blue-300"
                        title={
                          car.batteryId
                            ? "Chỉnh sửa xe"
                            : "Chỉnh sửa xe / Gắn pin"
                        }
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {car.batteryId
                            ? "Chỉnh sửa"
                            : "Chỉnh sửa / Gắn pin"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="text-6xl mb-4">🚗</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Chưa có xe nào
          </h3>
          <p className="text-gray-500 mb-6">
            Thêm xe đầu tiên để bắt đầu sử dụng dịch vụ thay pin
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Thêm xe đầu tiên</span>
          </button>
        </div>
      )}

      <CarModal
        isOpen={showModal}
        onClose={handleCloseModal}
        editingCar={editingCar}
        onSave={handleSave}
        onAttachBattery={handleAttachBattery}
        isLoading={isCreating || isUpdating || isAttaching}
      />
    </div>
  );
};

export default MyCar;
