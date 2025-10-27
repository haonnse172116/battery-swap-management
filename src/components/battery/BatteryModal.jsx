import {
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import {
  useCreateBatteryMutation,
  useUpdateBatteryMutation,
} from '../../services/battery.service.js';
import { useGetAllBatteryTypesQuery } from '../../services/batteryType.service.js';
import { useGetStationsQuery } from '../../services/station.service.js';

const BatteryModal = ({ isOpen, onClose, battery = null, onSuccess }) => {
  const isEdit = !!battery;
  
  const [formData, setFormData] = useState({
    serialNo: '',
    voltage: '',
    capacityWh: '',
    imageUrl: '',
    stationId: '',
    batteryTypeId: '',
    owner: 'Station',
    status: 'Available',
  });

  const [errors, setErrors] = useState({});

  const { data: stationsResponse } = useGetStationsQuery({ page: 1, pageSize: 100 });
  const { data: batteryTypesData } = useGetAllBatteryTypesQuery();
  
  const [createBattery, { isLoading: isCreating }] = useCreateBatteryMutation();
  const [updateBattery, { isLoading: isUpdating }] = useUpdateBatteryMutation();

  const stations = stationsResponse?.content || stationsResponse?.data || [];
  const batteryTypes = batteryTypesData?.batteryTypes || [];
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (battery && isOpen) {
      setFormData({
        serialNo: battery.serialNo || '',
        voltage: battery.voltage || '',
        capacityWh: battery.capacityWh || '',
        imageUrl: battery.imageUrl || '',
        stationId: battery.stationId || '',
        batteryTypeId: battery.batteryTypeId || '',
        owner: battery.owner || 'Station',
        status: battery.status || 'Available',
      });
    } else if (!isEdit && isOpen) {
      setFormData({
        serialNo: '',
        voltage: '',
        capacityWh: '',
        imageUrl: '',
        stationId: '',
        batteryTypeId: '',
        owner: 'Station',
        status: 'Available',
      });
    }
    setErrors({});
  }, [battery, isEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.serialNo) {
      newErrors.serialNo = 'Số serial là bắt buộc';
    } else if (isNaN(formData.serialNo)) {
      newErrors.serialNo = 'Số serial phải là số';
    }

    if (!formData.voltage) {
      newErrors.voltage = 'Điện áp là bắt buộc';
    }

    if (!formData.capacityWh) {
      newErrors.capacityWh = 'Dung lượng là bắt buộc';
    } else if (isNaN(formData.capacityWh) || parseInt(formData.capacityWh) <= 0) {
      newErrors.capacityWh = 'Dung lượng phải là số dương';
    }

    if (!formData.batteryTypeId) {
      newErrors.batteryTypeId = 'Loại pin là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const batteryData = {
        ...formData,
        serialNo: parseInt(formData.serialNo),
        capacityWh: parseInt(formData.capacityWh),
        stationId: formData.stationId || null,
      };

      if (isEdit) {
        await updateBattery({
          batteryId: battery.batteryId,
          ...batteryData,
        }).unwrap();
      } else {
        await createBattery(batteryData).unwrap();
      }
      
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving battery:', error);
      if (error.data?.message) {
        setErrors({ submit: error.data.message });
      } else {
        setErrors({ submit: 'Có lỗi xảy ra khi lưu pin' });
      }
    }
  };

  if (!isOpen) return null;

  const batteryStatuses = [
    { value: 'Available', label: 'Có sẵn' },
    { value: 'InUse', label: 'Đang sử dụng' },
    { value: 'Charging', label: 'Đang sạc' },
    { value: 'Maintenance', label: 'Bảo trì' },
    { value: 'Damaged', label: 'Hỏng' },
  ];

  const ownerTypes = [
    { value: 'Station', label: 'Trạm' },
    { value: 'Driver', label: 'Tài xế' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Chỉnh sửa Pin' : 'Thêm Pin mới'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Serial Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số Serial *
              </label>
              <input
                type="number"
                name="serialNo"
                value={formData.serialNo}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.serialNo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập số serial"
              />
              {errors.serialNo && (
                <p className="text-red-500 text-sm mt-1">{errors.serialNo}</p>
              )}
            </div>

            {/* Voltage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Điện áp (V) *
              </label>
              <input
                type="text"
                name="voltage"
                value={formData.voltage}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.voltage ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ví dụ: 48V, 72V"
              />
              {errors.voltage && (
                <p className="text-red-500 text-sm mt-1">{errors.voltage}</p>
              )}
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dung lượng (Wh) *
              </label>
              <input
                type="number"
                name="capacityWh"
                value={formData.capacityWh}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.capacityWh ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ví dụ: 5000"
              />
              {errors.capacityWh && (
                <p className="text-red-500 text-sm mt-1">{errors.capacityWh}</p>
              )}
            </div>

            {/* Battery Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại Pin *
              </label>
              <select
                name="batteryTypeId"
                value={formData.batteryTypeId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.batteryTypeId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Chọn loại pin</option>
                {batteryTypes.map((type) => (
                  <option key={type.batteryTypeId} value={type.batteryTypeId}>
                    {type.batteryTypeName}
                  </option>
                ))}
              </select>
              {errors.batteryTypeId && (
                <p className="text-red-500 text-sm mt-1">{errors.batteryTypeId}</p>
              )}
            </div>

            {/* Owner */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chủ sở hữu
              </label>
              <select
                name="owner"
                value={formData.owner}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {ownerTypes.map((owner) => (
                  <option key={owner.value} value={owner.value}>
                    {owner.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {batteryStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Station Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phân bổ trạm
              </label>
              <select
                name="stationId"
                value={formData.stationId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chưa phân bổ</option>
                {stations.map((station) => (
                  <option key={station.stationId} value={station.stationId}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL hình ảnh
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/battery-image.jpg"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatteryModal;