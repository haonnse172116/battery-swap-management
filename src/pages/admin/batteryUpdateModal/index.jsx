import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useGetAllBatteryTypesQuery } from '@/services/batteryType.service';
import { useLazyGetCloudinarySignatureQuery, uploadToCloudinary } from '@/services/upload.service';

export default function BatteryUpdateModal({ open, battery, stations = [], onClose, onSave }) {
    const [form, setForm] = useState({
        batteryId: '', serialNo: '', owner: '', status: '', voltage: '', capacityWh: '', imageUrl: '', stationId: '', batteryTypeId: '',
    });

    const { data: typesData } = useGetAllBatteryTypesQuery({ page: 1, pageSize: 200 });
    const types = typesData?.batteryTypes || [];

    // image states
    const [imagePreview, setImagePreview] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // cloudinary signature hook
    const [getCloudinarySignature] = useLazyGetCloudinarySignatureQuery();

    useEffect(() => {
        setForm({
            batteryId: battery?.batteryId || '',
            serialNo: battery?.serialNo ?? '',
            owner: battery?.owner || '',
            status: battery?.status || '',
            voltage: battery?.voltage || '',
            capacityWh: battery?.capacityWh ?? '',
            imageUrl: battery?.imageUrl || battery?.imageURL || '',
            stationId: battery?.stationId || '',
            batteryTypeId: battery?.batteryTypeId || '',
        });
        setImagePreview(battery?.imageUrl || battery?.imageURL || '');
        setImageFile(null);
    }, [battery, open]);

    if (!open) return null;

    const onChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const validate = () => {
        const err = [];
        if (!form.serialNo && form.serialNo !== 0) err.push('Serial number is required');
        if (form.capacityWh && isNaN(Number(form.capacityWh))) err.push('Capacity must be a number');
        if (!form.stationId) err.push('Station is required');
        if (err.length) toast.error(err.join(', '));
        return err.length === 0;
    };

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh hợp lệ');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File ảnh không được vượt quá 5MB');
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    // upload to Cloudinary (returns secure_url or throws)
    const uploadImage = async () => {
        if (!imageFile) return form.imageUrl || '';
        setUploadingImage(true);
        try {
            // get signature/presigned data from backend
            const sigResp = await getCloudinarySignature({ fileName: imageFile.name }).unwrap();
            const sigContent = sigResp?.content || sigResp; // depending on your API shape
            if (!sigContent) throw new Error('Không lấy được signature upload');

            // call utility to upload file (should return upload result with secure_url)
            const uploadResult = await uploadToCloudinary(imageFile, sigContent);
            if (!uploadResult || !uploadResult.secure_url) throw new Error('Upload thất bại');
            // update preview & form field with final url
            setImagePreview(uploadResult.secure_url);
            setForm(prev => ({ ...prev, imageUrl: uploadResult.secure_url }));
            return uploadResult.secure_url;
        } catch (err) {
            console.error('Upload error', err);
            toast.error(err?.data?.message || err.message || 'Tải ảnh lên thất bại');
            throw err;
        } finally {
            setUploadingImage(false);
        }
    };

    // save handler: upload image first if a new file was chosen, then call onSave
    const save = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!validate()) return;

        try {
            // if new image file chosen -> upload and get url
            let finalImageUrl = form.imageUrl || '';
            if (imageFile) {
                const t = toast.loading('Đang tải ảnh lên...');
                try {
                    finalImageUrl = await uploadImage();
                    toast.dismiss(t);
                    toast.success('Tải ảnh lên thành công');
                } catch (uploadErr) {
                    toast.dismiss(t);
                    // uploadImage already showed error toast; stop save
                    return;
                }
            }

            // prepare payload
            const payload = {
                ...form,
                serialNo: Number(form.serialNo),
                capacityWh: Number(form.capacityWh) || 0,
                imageUrl: finalImageUrl,
            };

            // call parent saver
            // allow parent to handle create/update by passing payload
            await Promise.resolve(onSave(payload));
            toast.success('Lưu thành công');
            onClose();
        } catch (err) {
            console.error('Save error', err);
            toast.error(err?.data?.message || 'Lưu thất bại');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[1px] bg-black/40">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="relative z-10 w-[min(95%,850px)] bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="p-5 border-b bg-gradient-to-r from-blue-50 to-blue-100 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        ⚙️ Cập nhật thông tin pin
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-xl leading-none">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm overflow-y-auto max-h-[70vh]">
                    {/* Inputs */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Serial No</label>
                        <input name="serialNo" value={form.serialNo} onChange={onChange} className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-400 outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                        <input name="owner" value={form.owner} onChange={onChange} className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-400 outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select name="status" value={form.status} onChange={onChange} className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-400 outline-none">
                            <option value="Available">Available</option>
                            <option value="InUse">InUse</option>
                            <option value="Charging">Charging</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Damaged">Damaged</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Voltage</label>
                        <input name="voltage" value={form.voltage} onChange={onChange} className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-400 outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Wh)</label>
                        <input name="capacityWh" value={form.capacityWh} onChange={onChange} className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-400 outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Battery Type</label>
                        <select name="batteryTypeId" value={form.batteryTypeId} onChange={onChange} className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-400 outline-none">
                            <option value="">-- Chọn loại pin --</option>
                            {types.map(t => <option key={t.batteryTypeId} value={t.batteryTypeId}>{t.batteryTypeName}</option>)}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạm</label>
                        <select name="stationId" value={form.stationId} onChange={onChange} className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-400 outline-none">
                            <option value="">-- Chọn trạm --</option>
                            {stations.map(s => <option key={s.stationId || s.id} value={s.stationId || s.id}>{s.stationName || s.name}</option>)}
                        </select>
                    </div>
                    
                    {/* Image Upload */}
                    <div className="md:col-span-2 mt-2">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">Hình ảnh pin</label>
                        <div className="relative">
                            <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" id="image-upload" />
                            {imagePreview ? (
                                <div>
                                    <div className="relative w-full h-64 bg-white border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                                        <img
                                            src={imagePreview}
                                            alt="Battery preview"
                                            className="w-full h-full object-cover"
                                            onError={() => setImagePreview(null)}
                                        />
                                    </div>
                                    <div className="mt-3 flex gap-2 justify-center">
                                        <label htmlFor="image-upload" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md cursor-pointer text-sm">
                                            Thay đổi ảnh
                                        </label>
                                        <button type="button" onClick={() => { setImagePreview(null); setImageFile(null); setForm(prev => ({ ...prev, imageUrl: '' })); }} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm">
                                            Xóa ảnh
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                                    <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mb-2" />
                                    <p className="text-gray-700 font-semibold">Tải ảnh pin lên</p>
                                    <p className="text-gray-400 text-xs mt-1">JPG, PNG, GIF tối đa 5MB</p>
                                </label>
                            )}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition">Hủy</button>
                    <button
                        onClick={save}
                        disabled={uploadingImage}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-60"
                    >
                        {uploadingImage ? 'Đang tải ảnh...' : 'Lưu & Xác nhận'}
                    </button>
                </div>
            </div>
        </div>
    );
}
