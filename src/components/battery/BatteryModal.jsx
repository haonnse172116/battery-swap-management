import {
  XMarkIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  CloudArrowUpIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { CpuChipIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import {
  useCreateBatteryMutation,
  useUpdateBatteryMutation,
} from '../../services/battery.service.js';
import { useGetAllBatteryTypesQuery } from '../../services/batteryType.service.js';
import { useGetStationsQuery } from '../../services/station.service.js';
import { 
  useLazyGetCloudinarySignatureQuery,
  uploadToCloudinary
} from '../../services/upload.service.js';

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { data: stationsResponse } = useGetStationsQuery({ page: 1, pageSize: 100 });
  const { data: batteryTypesData } = useGetAllBatteryTypesQuery({ page: 1, pageSize: 100 });
  const [getCloudinarySignature] = useLazyGetCloudinarySignatureQuery();
  
  const [createBattery, { isLoading: isCreating }] = useCreateBatteryMutation();
  const [updateBattery, { isLoading: isUpdating }] = useUpdateBatteryMutation();

  const stations = stationsResponse?.content || stationsResponse?.data || [];
  const batteryTypes = batteryTypesData?.batteryTypes || [];
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (battery && isOpen) {
      console.log('Opening modal for battery:', battery);
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
      console.log('Setting imagePreview to:', battery.imageUrl);
      setImagePreview(battery.imageUrl || null);
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
      setImagePreview(null);
    }
    setErrors({});
    setImageFile(null);
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

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Selected file:', file);
      
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          image: 'Vui lòng chọn file ảnh hợp lệ'
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: 'File ảnh không được vượt quá 5MB'
        }));
        return;
      }

      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('FileReader loaded, setting preview');
        setImagePreview(e.target.result);
      };
      reader.onerror = (e) => {
        console.error('FileReader error:', e);
      };
      reader.readAsDataURL(file);

      setErrors(prev => ({
        ...prev,
        image: ''
      }));
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.imageUrl;

    try {
      setUploadingImage(true);

      const signatureResponse = await getCloudinarySignature({ fileName: 'batteries' }).unwrap();
      
      if (!signatureResponse?.content) {
        throw new Error('Failed to get upload signature');
      }

      const uploadResult = await uploadToCloudinary(imageFile, signatureResponse.content);
      
      // Update the preview with the uploaded URL
      setImagePreview(uploadResult.secure_url);
      
      return uploadResult.secure_url;
    } catch (error) {
      console.error('Image upload failed:', error);
      setErrors(prev => ({
        ...prev,
        image: 'Tải ảnh lên thất bại. Vui lòng thử lại.'
      }));
      throw error;
    } finally {
      setUploadingImage(false);
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
      // Upload image first if there's a new image file
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const batteryData = {
        ...formData,
        serialNo: parseInt(formData.serialNo),
        capacityWh: parseInt(formData.capacityWh),
        stationId: formData.stationId || null,
        imageUrl,
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

  console.log('Rendering BatteryModal - imagePreview:', imagePreview);

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
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          maxWidth: '56rem',
          width: '100%',
          maxHeight: '95vh',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="relative bg-blue-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <CpuChipIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {isEdit ? 'Chỉnh sửa Pin' : 'Thêm Pin mới'}
                </h2>
                <p className="text-blue-100 text-sm">
                  {isEdit ? 'Cập nhật thông tin pin trong hệ thống' : 'Thêm pin mới vào hệ thống quản lý'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl flex items-center justify-center transition-all duration-200"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <form onSubmit={handleSubmit} className="p-8">
            {errors.submit && (
              <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <XMarkIcon className="w-5 h-5 text-red-400" />
                  </div>
                  <p className="ml-3 text-red-800 text-sm">{errors.submit}</p>
                </div>
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
                    {station.stationName || station.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Hình ảnh pin
              </label>
              
              {/* Upload Area */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                
                {imagePreview ? (
                  /* Image Preview with Replace Option */
                  <div>
                    <div 
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '16rem',
                        backgroundColor: '#ffffff',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <img
                        src={imagePreview}
                        alt="Battery preview"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          console.error('Image failed to load:', imagePreview);
                          setImagePreview(null);
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', imagePreview);
                        }}
                      />
                    </div>
                    {/* Action buttons below image */}
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <label
                        htmlFor="image-upload"
                        style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          border: 'none'
                        }}
                      >
                        Thay đổi ảnh
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                          setFormData(prev => ({ ...prev, imageUrl: '' }));
                        }}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          border: 'none'
                        }}
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Upload Placeholder */
                  <label
                    htmlFor="image-upload"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '16rem',
                      border: '2px dashed #9ca3af',
                      borderRadius: '0.5rem',
                      cursor: uploadingImage ? 'not-allowed' : 'pointer',
                      backgroundColor: '#f9fafb',
                      opacity: uploadingImage ? 0.5 : 1,
                      transition: 'all 0.3s'
                    }}
                  >
                    {uploadingImage ? (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          width: '4rem',
                          height: '4rem',
                          backgroundColor: '#dbeafe',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 1rem auto'
                        }}>
                          <div style={{
                            width: '2rem',
                            height: '2rem',
                            border: '2px solid transparent',
                            borderTop: '2px solid #2563eb',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></div>
                        </div>
                        <p style={{ color: '#2563eb', fontWeight: '600', marginBottom: '0.25rem' }}>Đang tải ảnh lên...</p>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Vui lòng đợi trong giây lát</p>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <CloudArrowUpIcon style={{ 
                          width: '4rem', 
                          height: '4rem', 
                          color: '#6b7280',
                          margin: '0 auto 1rem auto',
                          display: 'block'
                        }} />
                        <p style={{ color: '#374151', fontWeight: '600', fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                          Tải ảnh pin lên
                        </p>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                          Nhấp để chọn hoặc kéo thả ảnh vào đây
                        </p>
                        <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                          JPG, PNG, GIF tối đa 5MB
                        </p>
                      </div>
                    )}
                  </label>
                )}

                {errors.image && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm flex items-center gap-2">
                      <XMarkIcon className="w-4 h-4" />
                      {errors.image}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading || uploadingImage}
                className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {uploadingImage ? (
                  <>
                    <ArrowUpTrayIcon className="w-4 h-4 animate-pulse" />
                    <span>Đang tải ảnh...</span>
                  </>
                ) : isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang lưu...</span>
                  </>
                ) : isEdit ? (
                  <>
                    <CpuChipIcon className="w-4 h-4" />
                    <span>Cập nhật</span>
                  </>
                ) : (
                  <>
                    <CpuChipIcon className="w-4 h-4" />
                    <span>Thêm mới</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BatteryModal;