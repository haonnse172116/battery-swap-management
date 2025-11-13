import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/common/ConfirmModal.jsx';
import {
  useGetSubscriptionPlansQuery,
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,
} from '@/services/subcriptionPlan.service';

export default function SubscriptionCreate() {
  // fetch plans
  const { data, isLoading, refetch } = useGetSubscriptionPlansQuery({ page: 1, pageSize: 100 });
  const plans = data?.content || [];

  const [createPlan, { isLoading: creating }] = useCreateSubscriptionPlanMutation();
  const [updatePlan, { isLoading: updating }] = useUpdateSubscriptionPlanMutation();
  const [deletePlan, { isLoading: deleting }] = useDeleteSubscriptionPlanMutation();

  const [form, setForm] = useState({
    planId: null,
    name: '',
    description: '',
    monthlyFee: '',
    swapsIncluded: '',
    swapAmount: 1,
    active: true,
  });
  const [isEdit, setIsEdit] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'create' | 'update' | 'delete'
  const [confirmTargetId, setConfirmTargetId] = useState(null);

  useEffect(() => {
    // reset form when not in edit
    if (!isEdit) {
      setForm({ planId: null, name: '', description: '', monthlyFee: '', swapsIncluded: '', swapAmount: 1, active: true });
    }
  }, [isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const openEdit = (plan) => {
    setForm({
      planId: plan.planId || plan.id || plan.id,
      name: plan.name || '',
      description: plan.description || '',
      monthlyFee: plan.monthlyFee != null ? String(plan.monthlyFee) : plan.monthly_fee != null ? String(plan.monthly_fee) : '',
      swapsIncluded: plan.swapsIncluded || plan.swaps_included || '',
      swapAmount: plan.swapAmount != null ? plan.swapAmount : plan.swap_amount != null ? plan.swap_amount : 1,
      active: plan.active != null ? plan.active : !!plan.is_active,
    });
    setIsEdit(true);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // open confirm modal
    setConfirmAction(isEdit ? 'update' : 'create');
    setConfirmOpen(true);
  };

  const doCreate = async () => {
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        monthlyFee: Number(form.monthlyFee) || 0,
        swapsIncluded: form.swapsIncluded || String(form.swapAmount || 0),
        swapAmount: Number(form.swapAmount) || 0,
        active: !!form.active,
      };
      await toast.promise(createPlan(payload).unwrap(), {
        loading: 'Đang tạo gói...',
        success: 'Tạo gói thành công',
        error: (err) => err?.data?.message || 'Tạo gói thất bại',
      });
      setConfirmOpen(false);
      setIsEdit(false);
      refetch && refetch();
    } catch (err) {
      // handled by toast
    }
  };

  const doUpdate = async () => {
    try {
      const planId = form.planId;
      if (!planId) {
        toast.error('Không xác định gói để cập nhật');
        return;
      }
      const payload = {
        planId,
        name: form.name.trim(),
        description: form.description.trim(),
        monthlyFee: Number(form.monthlyFee) || 0,
        swapsIncluded: form.swapsIncluded || String(form.swapAmount || 0),
        swapAmount: Number(form.swapAmount) || 0,
        active: !!form.active,
      };
      await toast.promise(updatePlan(payload).unwrap(), {
        loading: 'Đang cập nhật...',
        success: 'Cập nhật thành công',
        error: (err) => err?.data?.message || 'Cập nhật thất bại',
      });
      setConfirmOpen(false);
      setIsEdit(false);
      refetch && refetch();
    } catch (err) {
      // handled
    }
  };

  const onDeleteConfirm = (planId) => {
    setConfirmTargetId(planId);
    setConfirmAction('delete');
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    try {
      const planId = confirmTargetId;
      if (!planId) {
        toast.error('Không xác định gói để xóa');
        return;
      }
      await toast.promise(deletePlan(planId).unwrap(), {
        loading: 'Đang xóa...',
        success: 'Xóa thành công',
        error: (err) => err?.data?.message || 'Xóa thất bại',
      });
      setConfirmOpen(false);
      setConfirmTargetId(null);
      refetch && refetch();
    } catch (err) {
      // handled
    }
  };

  const onConfirm = () => {
    if (confirmAction === 'create') return doCreate();
    if (confirmAction === 'update') return doUpdate();
    if (confirmAction === 'delete') return doDelete();
    setConfirmOpen(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Quản lý gói thuê pin</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* left: list */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Các gói đã tạo</h2>
          <div className="space-y-4">
            {isLoading && <div className="p-4 text-gray-500">Đang tải...</div>}
            {!isLoading && plans.length === 0 && <div className="p-4 text-gray-400 bg-white rounded shadow text-center">Chưa có gói nào</div>}
            {!isLoading && plans.length > 0 && (
              <>
                {plans.map((plan) => (
                  <div key={plan.planId || plan.id} className="bg-white rounded-xl shadow p-5 flex flex-col gap-2 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-green-700 text-lg">{plan.name}</div>
                        <div className="text-sm text-gray-500 mt-1">{plan.description}</div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded-full text-xs font-semibold ${plan.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{plan.active ? 'Kích hoạt' : 'Ngưng'}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                      <span>Giá thuê: <span className="font-semibold">{(plan.monthlyFee ?? plan.monthly_fee ?? 0).toLocaleString()} VNĐ</span></span>
                      <span>Số lượt đổi pin: <span className="font-semibold">{plan.swapAmount ?? 0}</span></span>
                    </div>

                    <div className="flex gap-2 mt-3 justify-end">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm" onClick={() => openEdit(plan)}>Sửa</button>
                      <button className="px-3 py-1 bg-red-600 text-white rounded text-sm" onClick={() => onDeleteConfirm(plan.planId || plan.id)}>Xóa</button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* right: form */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">{isEdit ? 'Chỉnh sửa gói thuê pin' : 'Tạo gói thuê pin mới'}</h2>
          <form onSubmit={onSubmit} className="bg-white shadow rounded-2xl p-7 space-y-5 border border-gray-100">
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Tên gói</label>
              <input name="name" value={form.name} onChange={handleChange} required className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="VD: Gói tiết kiệm" />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">Mô tả</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Mô tả ngắn về gói thuê..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Giá thuê (VNĐ)</label>
                <input name="monthlyFee" type="number" value={form.monthlyFee} onChange={handleChange} min={0} required className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">Số lượt đổi pin</label>
                <input name="swapAmount" type="number" value={form.swapAmount} onChange={handleChange} min={1} required className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">Số lượt được bao gồm (hiển thị)</label>
              <input name="swapsIncluded" value={form.swapsIncluded} onChange={handleChange} placeholder="VD: 2 swaps/month" className="w-full border rounded-lg p-3" />
            </div>

            <div className="flex items-center gap-3 mt-2">
              <input type="checkbox" name="active" checked={form.active} onChange={handleChange} className="w-4 h-4 accent-green-600" />
              <label className="font-semibold text-gray-700">Kích hoạt gói này</label>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold">{isEdit ? 'Cập nhật' : 'Tạo mới'}</button>
              {isEdit && <button type="button" onClick={() => { setIsEdit(false); setForm({ planId: null, name: '', description: '', monthlyFee: '', swapsIncluded: '', swapAmount: 1, active: true }); }} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-semibold">Hủy</button>}
            </div>
          </form>
        </div>
      </div>

      <ConfirmModal open={confirmOpen} title={confirmAction === 'delete' ? 'Xác nhận xóa' : confirmAction === 'update' ? 'Xác nhận cập nhật' : 'Xác nhận tạo'} onConfirm={onConfirm} onCancel={() => { setConfirmOpen(false); setConfirmTargetId(null); }} confirmText="Đồng ý" cancelText="Hủy" isLoading={creating || updating || deleting}>
        <div className="text-sm text-gray-700">
          {confirmAction === 'delete' ? (
            <div>Bạn chắc chắn muốn xóa gói này?</div>
          ) : confirmAction === 'update' ? (
            <div>Bạn chắc chắn muốn cập nhật gói <strong>{form.name}</strong>?</div>
          ) : (
            <div>Bạn chắc chắn muốn tạo gói <strong>{form.name}</strong>?</div>
          )}
        </div>
      </ConfirmModal>
    </div>
  );
}
