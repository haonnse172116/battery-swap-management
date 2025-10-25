import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  useGetAllVehiclesQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
} from "../../../services/vehicle.service";
import { useGetAllBatteryTypesQuery } from "../../../services/batteryType.service";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const MyCar = () => {
  const currentUser = useSelector((state) => state.auth.user);

  // ✅ Fetch vehicles
  const { data: vehiclesData, isLoading, refetch } = useGetAllVehiclesQuery({
    pageSize: 100,
  });

  // ✅ Fetch battery types for dropdown
  const { data: batteryTypesData, isLoading: isLoadingTypes } =
    useGetAllBatteryTypesQuery();

  // ✅ Mutations
  const [createVehicle, { isLoading: isCreating }] = useCreateVehicleMutation();
  const [updateVehicle, { isLoading: isUpdating }] = useUpdateVehicleMutation();
  const [deleteVehicle, { isLoading: isDeleting }] = useDeleteVehicleMutation();

  // Filter current user's vehicles
  const cars = vehiclesData?.vehicles?.filter(
    (v) => v.userId === currentUser?.userId
  )?.reverse()|| [];
  const batteryTypes = batteryTypesData?.batteryTypes || [];

  // --- Modal state ---
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [form, setForm] = useState({
    batteryTypeId: "",
    vBrand: "",
    model: "",
    licensePlate: "",
  });
  const [error, setError] = useState("");

  // --- Handlers ---
  const handleOpenAdd = () => {
    setEditingCar(null);
    setForm({
      batteryTypeId: "",
      vBrand: "",
      model: "",
      licensePlate: "",
    });
    setError("");
    setShowModal(true);
  };

  const handleOpenEdit = (car) => {
    setEditingCar(car);
    setForm({
      batteryTypeId: car.batteryTypeId || "",
      vBrand: car.brand || "",
      model: car.model || "",
      licensePlate: car.licensePlate || "",
    });
    setError("");
    setShowModal(true);
  };

  const validateForm = () => {
    if (!form.batteryTypeId) {
      setError("Vui lòng chọn loại pin");
      return false;
    }
    if (!form.vBrand.trim()) {
      setError("Vui lòng nhập hãng xe");
      return false;
    }
    if (!form.model.trim()) {
      setError("Vui lòng nhập model xe");
      return false;
    }
    if (!form.licensePlate.trim()) {
      setError("Vui lòng nhập biển số xe");
      return false;
    }
    // Validate license plate format (optional)
    const plateRegex = /^[0-9]{2}[A-Z]-[0-9]{3}\.[0-9]{2}$/;
    if (!plateRegex.test(form.licensePlate)) {
      setError("Biển số không đúng định dạng (VD: 51H-123.45)");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editingCar) {
        // ✅ Update existing vehicle
        await updateVehicle({
          vehicleId: editingCar.vehicleId,
          ...form,
        }).unwrap();
        alert("Cập nhật xe thành công!");
      } else {
        // ✅ Create new vehicle
        await createVehicle(form).unwrap();
        alert("Thêm xe thành công!");
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      setError(err.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleRemove = async (vehicleId, licensePlate) => {
    if (!confirm(`Bạn có chắc muốn xóa xe ${licensePlate}?`)) return;

    try {
      await deleteVehicle(vehicleId).unwrap();
      alert("Xóa xe thành công!");
      refetch();
    } catch (err) {
      alert(err.data?.message || "Không thể xóa xe");
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
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Xe của tôi</h1>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200"
        >
          <PlusIcon className="w-5 h-5" />
          Thêm xe
        </button>
      </div>

      {/* List */}
      {cars.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {cars.map((car) => (
            <li
              key={car.vehicleId}
              className="flex items-center justify-between py-4 px-3 rounded-xl border border-transparent hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <img
                  src={car.image}
                  alt={car.name}
                  className="w-28 h-20 object-cover rounded-xl border border-gray-200 shadow-sm"
                  onError={(e) => {
                    e.target.src = "/vf8.png";
                  }}
                />
                <div>
                  <p className="font-semibold text-gray-900">{car.name}</p>
                  <p className="text-sm text-gray-500 font-mono">
                    {car.licensePlate}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                      🔋 {car.batteryType}
                    </span>
                    {car.batteryId && (
                      <span className="text-xs text-gray-500">
                        Pin: {car.batteryId.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEdit(car);
                  }}
                  className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 transition"
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(car.vehicleId, car.licensePlate);
                  }}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500 mb-4">Bạn chưa thêm xe nào</p>
          <button
            onClick={handleOpenAdd}
            className="text-blue-600 hover:underline"
          >
            Thêm xe ngay
          </button>
        </div>
      )}

      {/* --- Modal --- */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold mb-4">
              {editingCar ? "Chỉnh sửa xe" : "Thêm xe mới"}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Battery Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại pin <span className="text-red-500">*</span>
                </label>
                {isLoadingTypes ? (
                  <div className="text-sm text-gray-500">Đang tải...</div>
                ) : (
                  <select
                    value={form.batteryTypeId}
                    onChange={(e) =>
                      setForm({ ...form, batteryTypeId: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">-- Chọn loại pin --</option>
                    {batteryTypes.map((type) => (
                      <option
                        key={type.batteryTypeId}
                        value={type.batteryTypeId}
                      >
                        {type.typeName} {type.capacity && `(${type.capacity})`}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  VD: type-001, type-002
                </p>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hãng xe <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.vBrand}
                  onChange={(e) => setForm({ ...form, vBrand: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="VD: VinFast, Toyota"
                />
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="VD: VF e34, Corolla Cross"
                />
              </div>

              {/* License Plate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biển số xe <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.licensePlate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      licensePlate: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  placeholder="51H-123.45"
                  maxLength={11}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Định dạng: 51H-123.45
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={isCreating || isUpdating}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating || isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang lưu...
                  </>
                ) : (
                  "Lưu"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCar;
