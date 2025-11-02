import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useGetAllBatteryTypesQuery } from '../../../../services/batteryType.service';
import { useGetUnassignedBatteriesQuery } from '../../../../services/battery.service';
import { useSelector } from 'react-redux';

const CarModal = ({ 
  isOpen, 
  onClose, 
  editingCar, 
  onSave, 
  onAttachBattery, 
  isLoading 
}) => {
  
  const currentUser = useSelector((state) => state.auth.user);

  
  const { data: batteryTypesData, isLoading: isLoadingTypes } = useGetAllBatteryTypesQuery();
  const batteryTypes = batteryTypesData?.batteryTypes || batteryTypesData?.content || [];

  
  const [form, setForm] = useState({
    vBrand: "",
    model: "",
    licensePlate: "",
    batteryTypeId: "", 
  });
  const [error, setError] = useState("");

  
  const [showBatterySelection, setShowBatterySelection] = useState(false);
  const [selectedBatteryId, setSelectedBatteryId] = useState("");
  
  
  const { 
    data: batteriesData, 
    isLoading: isLoadingBatteries,
    error: batteriesError 
  } = useGetUnassignedBatteriesQuery(
    editingCar?.batteryTypeId ? { batteryTypeId: editingCar.batteryTypeId } : {}, 
    { 
      skip: !editingCar || !showBatterySelection || !editingCar.batteryTypeId 
    }
  );

  const availableBatteries = batteriesData?.content || batteriesData || [];

  
  const getBatteryTypeName = (batteryTypeId) => {
    const batteryType = batteryTypes.find(type => type.batteryTypeId === batteryTypeId);
    return batteryType ? `${batteryType.typeName}${batteryType.capacity ? ` (${batteryType.capacity}kWh)` : ''}` : batteryTypeId;
  };

  
  useEffect(() => {
    if (isOpen) {
      if (editingCar) {
        setForm({
          vBrand: editingCar.vBrand || "",
          model: editingCar.model || "",
          licensePlate: editingCar.licensePlate || "",
          batteryTypeId: editingCar.batteryTypeId || "", // Set existing battery type
        });
      } else {
        setForm({
          vBrand: "",
          model: "",
          licensePlate: "",
          batteryTypeId: "", 
        });
      }
      setError("");
      setShowBatterySelection(false);
      setSelectedBatteryId("");
    }
  }, [isOpen, editingCar]);

  
  const validateForm = () => {
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
    
    const plateRegex = /^[0-9]{2}[A-Z]-[0-9]{3}\.[0-9]{2}$/;
    if (!plateRegex.test(form.licensePlate)) {
      setError("Biển số không đúng định dạng (VD: 51H-123.45)");
      return false;
    }

    if (!editingCar && !form.batteryTypeId) {
      setError("Vui lòng chọn loại pin cho xe");
      return false;
    }
    
    return true;
  };

  
  const handleSave = () => {
    if (!validateForm()) return;
    onSave(form);
  };

  
  const handleAttachBattery = () => {
    if (!selectedBatteryId) {
      setError("Vui lòng chọn pin để gắn");
      return;
    }
    onAttachBattery({
      vehicleId: editingCar.vehicleId,
      batteryId: selectedBatteryId,
      performByUserId: currentUser?.userId || currentUser?.id
    });
   
  };

  // ✅ Check if vehicle already has battery
  const vehicleHasBattery = editingCar?.batteryId && editingCar.batteryId.trim() !== "";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingCar ? "Chỉnh sửa xe" : "Thêm xe mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            ❌ {error}
          </div>
        )}

        <div className="space-y-4">
          {/* ✅ Battery Type Selection - Required for new vehicles, read-only for existing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại pin {!editingCar && <span className="text-red-500">*</span>}
            </label>
            {editingCar ? (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">
                    🔋 {getBatteryTypeName(editingCar.batteryTypeId)}
                  </span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                    Cố định
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Loại pin không thể thay đổi sau khi đã thiết lập
                </p>
              </div>
            ) : (
              // Dropdown for new vehicles
              <div>
                {isLoadingTypes ? (
                  <div className="p-3 bg-gray-50 rounded-lg text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    Đang tải loại pin...
                  </div>
                ) : (
                  <select
                    value={form.batteryTypeId}
                    onChange={(e) => setForm({ ...form, batteryTypeId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  >
                    <option value="">-- Chọn loại pin --</option>
                    {batteryTypes.map((type) => (
                      <option key={type.batteryTypeId} value={type.batteryTypeId}>
                        {type.typeName}{type.capacity ? ` (${type.capacity}kWh)` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          {/* ✅ Current Battery - Edit mode only */}
          {editingCar && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pin hiện tại
              </label>
              {vehicleHasBattery ? (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-green-800 font-medium">{editingCar.batteryId}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        ✅ Đã gắn pin
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
                  <p className="text-sm text-yellow-700">⚠️ Xe chưa có pin</p>
                </div>
              )}

              {/* ✅ Battery Selection Toggle - Only if vehicle has no battery and has batteryTypeId */}
              {!vehicleHasBattery && editingCar.batteryTypeId && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBatterySelection(!showBatterySelection)}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    🔗 Gắn pin mới
                  </button>
                </div>
              )}

              {/* ✅ Message when vehicle already has battery */}
              {vehicleHasBattery && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">ℹ️</span>
                    <div>
                      <p className="text-sm text-blue-800 font-medium">
                        Xe đã được gắn pin
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Để thay pin, vui lòng đến trạm thay pin hoặc liên hệ hỗ trợ
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ✅ Battery Selection - Only show if vehicle has no battery */}
          {editingCar && showBatterySelection && !vehicleHasBattery && editingCar.batteryTypeId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-3">
                🔗 Gắn pin mới
              </h4>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại pin của xe
                </label>
                <div className="p-2 bg-white rounded border border-gray-200 text-sm text-gray-800">
                  🔋 {getBatteryTypeName(editingCar.batteryTypeId)}
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn pin <span className="text-red-500">*</span>
                </label>
                {isLoadingBatteries ? (
                  <div className="p-3 bg-gray-50 rounded-lg text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    Đang tải pin khả dụng...
                  </div>
                ) : batteriesError ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center text-sm text-red-700">
                    ❌ Lỗi tải danh sách pin
                  </div>
                ) : availableBatteries.length === 0 ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center text-sm text-yellow-700">
                    ⚠️ Không có pin nào khả dụng cho loại pin này
                  </div>
                ) : (
                  <select
                    value={selectedBatteryId}
                    onChange={(e) => setSelectedBatteryId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  >
                    <option value="">-- Chọn pin --</option>
                    {availableBatteries.map((battery) => (
                      <option key={battery.batteryId} value={battery.batteryId}>
                        {battery.batteryTypeName} - Seri: {battery.serialNo || 0} - {battery.status || 'Khả dụng'}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Pin khả dụng: {availableBatteries.length}
                </p>
              </div>

              {/* ✅ Attach Battery Button */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAttachBattery}
                  disabled={!selectedBatteryId || isLoading}
                  className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang gắn...
                    </>
                  ) : (
                    <>
                      🔗 Gắn pin
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBatterySelection(false);
                    setSelectedBatteryId("");
                  }}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition text-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hãng xe <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.vBrand}
              onChange={(e) => setForm({ ...form, vBrand: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="VD: VinFast, Toyota"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="VD: VF e34, Corolla Cross"
            />
          </div>

          {/* ✅ License Plate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biển số xe <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.licensePlate}
              onChange={(e) => setForm({ ...form, licensePlate: e.target.value.toUpperCase() })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-mono"
              placeholder="51H-123.45"
              maxLength={11}
            />
            <p className="text-xs text-gray-500 mt-1">
              Định dạng: 51H-123.45
            </p>
          </div>
        </div>

        {/* ✅ Actions */}
        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <span>{editingCar ? "Cập nhật xe" : "Thêm xe"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarModal;