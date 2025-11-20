import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useGetAllBatteryTypesQuery } from '@/services/batteryType.service';
import { useGetStationsQuery } from '@/services/station.service';
import { useCreateBatteryMutation } from '@/services/battery.service';
import { useLazyGetCloudinarySignatureQuery, uploadToCloudinary } from '@/services/upload.service';

export default function BatteryAdd() {
    const [form, setForm] = useState({ serialNo: '', owner: 'Station', status: 'Available', voltage: '', capacityWh: '', imageUrl: '', stationId: '', batteryTypeId: '' });

    const { data: typesData } = useGetAllBatteryTypesQuery({ page: 1, pageSize: 200 });
    const types = typesData?.batteryTypes || [];

    const { data: stationsData } = useGetStationsQuery({ page: 1, pageSize: 10000 });
    const stations = stationsData?.content || [];

    const [imagePreview, setImagePreview] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [getCloudinarySignature] = useLazyGetCloudinarySignatureQuery();
    const [createBattery, { isLoading: creating }] = useCreateBatteryMutation();

    useEffect(() => { setImagePreview(form.imageUrl || ''); }, [form.imageUrl]);

    const onChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return toast.error('Vui lòng chọn file ảnh hợp lệ');
        if (file.size > 5 * 1024 * 1024) return toast.error('File ảnh không được vượt quá 5MB');
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const uploadImage = async () => {
        if (!imageFile) return form.imageUrl || '';
        setUploadingImage(true);
        try {
            const sigResp = await getCloudinarySignature({ fileName: imageFile.name }).unwrap();
            const sigContent = sigResp?.content || sigResp;
            if (!sigContent) throw new Error('Không lấy được signature upload');
            const result = await uploadToCloudinary(imageFile, sigContent);
            if (!result || !result.secure_url) throw new Error('Upload thất bại');
            setForm(prev => ({ ...prev, imageUrl: result.secure_url }));
            setImagePreview(result.secure_url);
            return result.secure_url;
        } catch (err) { console.error(err); toast.error(err?.message || 'Tải ảnh lên thất bại'); throw err; } finally { setUploadingImage(false); }
    };

    const validate = () => {
        const err = [];
        // serialNo is required and must be a non-negative integer
        if (form.serialNo === '' || form.serialNo == null) err.push('Serial number is required');
        else if (isNaN(Number(form.serialNo)) || !Number.isFinite(Number(form.serialNo))) err.push('Serial number must be a valid number');
        else if (Number(form.serialNo) < 0) err.push('Serial number must be non-negative');

        // capacityWh must be a non-negative number when provided
        if (form.capacityWh !== '' && form.capacityWh != null) {
            if (isNaN(Number(form.capacityWh)) || !Number.isFinite(Number(form.capacityWh))) err.push('Capacity must be a valid number');
            else if (Number(form.capacityWh) < 0) err.push('Capacity must be non-negative');
        }

        // voltage when provided must be non-negative number
        if (form.voltage !== '' && form.voltage != null) {
            if (isNaN(Number(form.voltage)) || !Number.isFinite(Number(form.voltage))) err.push('Voltage must be a valid number');
            else if (Number(form.voltage) < 0) err.push('Voltage must be non-negative');
        }

        // if (!form.stationId) err.push('Station is required');
        if (err.length) toast.error(err.join(', '));
        return err.length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            let finalImage = form.imageUrl || '';
            if (imageFile) {
                const t = toast.loading('Đang tải ảnh lên...');
                try { finalImage = await uploadImage(); toast.dismiss(t); toast.success('Tải ảnh lên thành công'); } catch (_) { toast.dismiss(t); return; }
            }

            const payload = {
                serialNo: Number(form.serialNo),
                owner: form.owner,
                status: form.status,
                voltage: form.voltage,
                capacityWh: Number(form.capacityWh) || 0,
                batteryTypeId: form.batteryTypeId,  
                imageUrl: finalImage || null,               // ảnh có thể null
                stationId: form.stationId || null,          // trạm có thể null
            };

            await createBattery({ battery: payload }).unwrap();
            toast.success('Tạo pin thành công');
            setForm({ serialNo: '', owner: 'Station', status: 'Available', voltage: '', capacityWh: '', imageUrl: '', stationId: '', batteryTypeId: '' });
            setImageFile(null); setImagePreview('');
        } catch (err) { console.error(err); toast.error(err?.data?.message || 'Tạo pin thất bại'); }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-3 flex items-center gap-2">
                ⚡ Thêm mới pin
            </h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left side - form fields */}
                <div className="space-y-5">
                    {[
                        ['Serial No', 'serialNo'],
                        // Owner — làm riêng vì cần set mặc định và disable
                    ].map(([label, name]) => (
                        <div key={name}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                            <input
                                name={name}
                                type="number"
                                min={0}
                                value={form[name]}
                                onChange={onChange}
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                                placeholder={`Nhập ${label.toLowerCase()}`}
                            />
                        </div>
                    ))}

                    {/* Owner (cố định là "Station") */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                        <input
                            name="owner"
                            value="Station"
                            disabled
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                    </div>

                    {[
                        ['Voltage', 'voltage'],
                        ['Capacity (Wh)', 'capacityWh'],
                    ].map(([label, name]) => (
                        <div key={name}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                            <input
                                name={name}
                                type="number"
                                min={0}
                                value={form[name]}
                                onChange={onChange}
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                                placeholder={`Nhập ${label.toLowerCase()}`}
                            />
                        </div>
                    ))}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={onChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                        >
                            {['Available', 'InUse', 'Charging', 'Maintenance', 'Damaged'].map(st => (
                                <option key={st} value={st}>{st}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Battery Type</label>
                        <select
                            name="batteryTypeId"
                            value={form.batteryTypeId}
                            onChange={onChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                        >
                            <option value="">-- Chọn loại pin --</option>
                            {types.map(t => (
                                <option key={t.batteryTypeId} value={t.batteryTypeId}>{t.batteryTypeName}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạm</label>
                        <select
                            name="stationId"
                            value={form.stationId}
                            onChange={onChange}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                        >
                            <option value="">-- Không gán trạm --</option>
                            {stations.map(s => (
                                <option key={s.stationId || s.id} value={s.stationId || s.id}>
                                    {s.name || s.stationName}
                                </option>
                            ))}
                        </select>
                    </div>

                </div>

                {/* Right side - image upload & action buttons*/}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh pin</label>
                    <div className="relative">
                        <input id="image-upload" type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

                        {imagePreview ? (
                            <div className="space-y-3">
                                <div className="w-full h-64 bg-white border rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
                                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                                </div>

                                <div className="flex gap-2">
                                    <label
                                        htmlFor="image-upload"
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition"
                                    >
                                        Thay đổi ảnh
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagePreview('');
                                            setImageFile(null);
                                            setForm(prev => ({ ...prev, imageUrl: '' }));
                                        }}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                    >
                                        Xóa ảnh
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label
                                htmlFor="image-upload"
                                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                            >
                                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mb-2" />
                                <div className="text-gray-700 font-medium">Tải ảnh pin lên</div>
                                <div className="text-gray-500 text-sm">Hỗ trợ JPG, PNG, GIF (tối đa 5MB)</div>
                            </label>
                        )}
                    </div>

                    <div className="flex item-center justify-center gap-3 pt-8">
                        <button
                            type="button"
                            onClick={() => {
                                setForm({
                                    serialNo: '',
                                    owner: 'Station',
                                    status: 'Available',
                                    voltage: '',
                                    capacityWh: '',
                                    imageUrl: '',
                                    stationId: '',
                                    batteryTypeId: '',
                                });
                                setImageFile(null);
                                setImagePreview('');
                            }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={creating || uploadingImage}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg shadow hover:shadow-md hover:brightness-110 disabled:opacity-60 transition"
                        >
                            {creating ? 'Đang tạo...' : 'Tạo pin'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
