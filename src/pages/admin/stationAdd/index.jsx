import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { MapPinIcon, BuildingStorefrontIcon, XCircleIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useCreateStationMutation } from '@/services/station.service';

export default function StationAdd() {
  const token = useSelector((s) => s.auth.accessToken);
  const [createStation, { isLoading }] = useCreateStationMutation();

  const [form, setForm] = useState({ name: '', address: '', latitude: '', longitude: '', isActive: true });
  const [errors, setErrors] = useState({});

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    setErrors((p) => ({ ...p, [name]: null }));
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = 'Tên trạm là bắt buộc';
    if (!form.address.trim()) err.address = 'Địa chỉ là bắt buộc';
    if (form.latitude && isNaN(Number(form.latitude))) err.latitude = 'Latitude phải là số';
    if (form.longitude && isNaN(Number(form.longitude))) err.longitude = 'Longitude phải là số';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Vui lòng điền đầy đủ form');
      return;
    }

    try {
      await createStation({ station: { name: form.name.trim(), address: form.address.trim(), latitude: Number(form.latitude) || 0, longitude: Number(form.longitude) || 0, isActive: !!form.isActive }, token }).unwrap();
      toast.success('Tạo trạm thành công');
      setForm({ name: '', address: '', latitude: '', longitude: '', isActive: true });
      setErrors({});
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || 'Tạo trạm thất bại');
    }
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

  return (
    <div className="min-h-screen flex items-center justify-center p-6 max-w-4xl mx-auto">
      <div className="rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-white to-slate-50 border border-gray-100">
        {/* header */}
        <div className="px-6 py-5 bg-white/70">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md text-white">
              <BuildingStorefrontIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Tạo trạm mới</h1>
              <p className="text-sm text-gray-500">Điền thông tin cơ bản để thêm trạm — vị trí là tuỳ chọn nhưng nên có để hiển thị trên bản đồ.</p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* form */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên trạm</label>
              <div className="relative">
                <input name="name" value={form.name} onChange={onChange} placeholder="VD: Trạm A" className={`w-full border ${errors.name ? 'border-red-300' : 'border-gray-200'} rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-300 transition`} />
                <div className="absolute right-2 top-2 text-gray-400"><CheckIcon className="w-5 h-5 opacity-40" /></div>
              </div>
              {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
              <div className="relative">
                <input name="address" value={form.address} onChange={onChange} placeholder="VD: 123 Đường B, Quận C" className={`w-full border ${errors.address ? 'border-red-300' : 'border-gray-200'} rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-300 transition`} />
                <div className="absolute right-2 top-2 text-gray-400"><MapPinIcon className="w-5 h-5 opacity-40" /></div>
              </div>
              {errors.address && <div className="text-xs text-red-600 mt-1">{errors.address}</div>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input name="latitude" value={form.latitude} onChange={onChange} placeholder="10.123456" className={`w-full border ${errors.latitude ? 'border-red-300' : 'border-gray-200'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition`} />
                {errors.latitude && <div className="text-xs text-red-600 mt-1">{errors.latitude}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input name="longitude" value={form.longitude} onChange={onChange} placeholder="106.123456" className={`w-full border ${errors.longitude ? 'border-red-300' : 'border-gray-200'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition`} />
                {errors.longitude && <div className="text-xs text-red-600 mt-1">{errors.longitude}</div>}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={onChange}
                  className="sr-only peer"
                />
                <div className="group peer ring-0 bg-gradient-to-tr from-rose-100 via-rose-400 to-rose-500 
                  rounded-full outline-none duration-300 after:duration-300 w-11 h-6 shadow-md 
                  peer-focus:outline-none 
                  after:content-['X'] after:rounded-full after:absolute after:bg-gray-50 after:outline-none 
                  after:h-4 after:w-4 after:top-1 after:left-1 after:-rotate-180 after:flex after:justify-center                
                  after:items-center 
                  after:text-rose-500 after:text-[10px] font-bold
                  peer-hover:after:scale-95 
                  peer-checked:after:translate-x-5 peer-checked:after:content-['✓'] peer-checked:after:rotate-0 
                  peer-checked:after:text-green-600 
                  peer-checked:bg-gradient-to-tr peer-checked:from-green-100 peer-checked:via-lime-400                
                  peer-checked:to-lime-500">
                </div>
                <span className="ml-3 text-sm text-gray-700">
                  Kích hoạt trạm
                </span>
              </label>

              <button
                type="button"
                onClick={autofillLocation}
                className="ml-auto px-3 py-1 bg-gray-50 border border-gray-200 rounded text-sm hover:bg-gray-100"
              >
                Tự động lấy vị trí
              </button>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white font-medium shadow-md transition-transform active:scale-95" style={{ background: 'linear-gradient(90deg,#06b6d4,#7c93ee)' }}>
                {isLoading ? (
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                ) : (
                  'Tạo trạm'
                )}
              </button>
            </div>
          </form>

          {/* preview */}
          <div className="hidden md:block">
            <div className="p-4 rounded-lg border border-gray-100 bg-gradient-to-br from-white to-slate-50 shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded text-blue-600"><MapPinIcon className="w-6 h-6" /></div>
                  <div>
                    <div className="text-sm text-gray-500">Xem trước trạm</div>
                    <div className="text-lg font-semibold text-gray-800 mt-1">{form.name || '— Tên trạm —'}</div>
                    <div className="text-sm text-gray-500 mt-1">{form.address || '— Địa chỉ —'}</div>
                  </div>
                </div>

                <div className="mt-6 border border-dashed border-gray-200 rounded-md p-3 bg-white">
                  <div className="text-xs text-gray-500">Kinh độ / Vĩ độ</div>
                  <div className="mt-1 text-sm font-medium">{form.latitude || '—'} , {form.longitude || '—'}</div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className={`px-2 py-1 rounded text-xs font-semibold ${form.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{form.isActive ? 'Hoạt động' : 'Ngưng'}</div>
                  <div className="ml-auto text-xs text-gray-400">ID sẽ được tự động tạo</div>
                </div>
              </div>

              <div className="mt-6">
                <button onClick={() => { setForm({ name: '', address: '', latitude: '', longitude: '', isActive: true }); toast('Đã đặt lại form') }} className="w-full px-3 py-2 border rounded-md text-sm hover:bg-gray-50">Reset form</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
