import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { MapPinIcon, BuildingStorefrontIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function StationUpdateModal({ open, station, onClose, onSave }) {
    const [form, setForm] = useState({ name: '', address: '', latitude: '', longitude: '', isActive: true });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (station) {
            setForm({
                name: station.name || '',
                address: station.address || '',
                latitude: station.latitude ?? '',
                longitude: station.longitude ?? '',
                isActive: station.isActive ?? true,
            });
            setErrors({});
        }
    }, [station]);

    if (!open) return null;

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
        setErrors((p) => ({ ...p, [name]: null }));
    };

    const validate = () => {
        const err = {};
        if (!form.name || !form.name.trim()) err.name = 'Tên trạm là bắt buộc';
        if (!form.address || !form.address.trim()) err.address = 'Địa chỉ là bắt buộc';
        if (form.latitude && isNaN(Number(form.latitude))) err.latitude = 'Latitude phải là số';
        if (form.longitude && isNaN(Number(form.longitude))) err.longitude = 'Longitude phải là số';
        setErrors(err);
        if (Object.keys(err).length > 0) toast.error('Vui lòng sửa các lỗi trong form');
        return Object.keys(err).length === 0;
    };

    const autofillLocation = () => {
        if (!navigator.geolocation) return toast.error('Trình duyệt không hỗ trợ geolocation');
        toast.loading('Đang lấy vị trí...', { id: 'geo' });
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                toast.dismiss('geo');
                setForm((p) => ({ ...p, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }));
                toast.success('Đã điền vị trí hiện tại');
            },
            (err) => {
                toast.dismiss('geo');
                toast.error('Không thể lấy vị trí: ' + err.message);
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    const handleSave = () => {
        if (!validate()) return;
        const payload = {
            ...station,
            name: form.name.trim(),
            address: form.address.trim(),
            latitude: Number(form.latitude) || 0,
            longitude: Number(form.longitude) || 0,
            isActive: !!form.isActive,
        };
        onSave(payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative z-10 w-[min(72%,600px)] bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="px-6 py-5 bg-white/70 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md text-white">
                            <BuildingStorefrontIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-800">Cập nhật trạm</h1>
                            <p className="text-sm text-gray-500">Chỉnh sửa thông tin trạm và lưu để xác nhận.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên trạm</label>
                            <div className="relative">
                                <input name="name" value={form.name} onChange={onChange} placeholder="VD: Trạm A" className={`w-full border ${errors.name ? 'border-red-300' : 'border-gray-200'} rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-300`} />
                                <div className="absolute right-2 top-2 text-gray-400"><CheckIcon className="w-5 h-5 opacity-40" /></div>
                            </div>
                            {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                            <div className="relative">
                                <input name="address" value={form.address} onChange={onChange} placeholder="VD: 123 Đường B, Quận C" className={`w-full border ${errors.address ? 'border-red-300' : 'border-gray-200'} rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-300`} />
                                <div className="absolute right-2 top-2 text-gray-400"><MapPinIcon className="w-5 h-5 opacity-40" /></div>
                            </div>
                            {errors.address && <div className="text-xs text-red-600 mt-1">{errors.address}</div>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                <input name="latitude" value={form.latitude} onChange={onChange} placeholder="10.123456" className={`w-full border ${errors.latitude ? 'border-red-300' : 'border-gray-200'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200`} />
                                {errors.latitude && <div className="text-xs text-red-600 mt-1">{errors.latitude}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                <input name="longitude" value={form.longitude} onChange={onChange} placeholder="106.123456" className={`w-full border ${errors.longitude ? 'border-red-300' : 'border-gray-200'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200`} />
                                {errors.longitude && <div className="text-xs text-red-600 mt-1">{errors.longitude}</div>}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                                <input type="checkbox" name="isActive" checked={form.isActive} onChange={onChange} className="sr-only peer" />
                                <div className="group peer ring-0 bg-gradient-to-tr from-rose-100 via-rose-400 to-rose-500 
                                    rounded-full outline-none duration-300 after:duration-300 w-11 h-6 shadow-md 
                                    peer-focus:outline-none 
                                    after:content-['X'] after:rounded-full after:absolute after:bg-gray-50 after:outline-none 
                                    after:h-4 after:w-4 after:top-1 after:left-1 after:-rotate-180 after:flex                   
                                    after:justify-center                
                                    after:items-center 
                                    after:text-rose-500 after:text-[10px] font-bold
                                    peer-hover:after:scale-95 
                                    peer-checked:after:translate-x-5 peer-checked:after:content-['✓']                  
                                    peer-checked:after:rotate-0 
                                    peer-checked:after:text-green-600 
                                    peer-checked:bg-gradient-to-tr peer-checked:from-green-100                  
                                    peer-checked:via-lime-400                
                                    peer-checked:to-lime-500">
                                </div>
                                <span className="ml-3 text-sm text-gray-700">Kích hoạt trạm</span>
                            </label>

                            <button
                                type="button"
                                onClick={autofillLocation}
                                className="ml-auto px-3 py-1 bg-gray-50 border border-gray-200 rounded text-sm hover:bg-gray-100"
                            >
                                Tự động lấy vị trí
                            </button>
                        </div>
                    </div>

                    {/* right column intentionally empty (no preview) */}
                    <div />
                </div>

                <div className="px-6 py-4 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded">Hủy</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">Lưu & Xác nhận</button>
                </div>
            </div>
        </div>
    );
}