import React, { useEffect, useMemo, useState } from 'react';
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

  const defaultForm = {
    planId: null,
    name: '',
    description: '',
    monthlyFee: 1000,
    swapAmount: 1,
    active: true,
  };

  const [form, setForm] = useState(defaultForm);
  const [isEdit, setIsEdit] = useState(false);

  const [errors, setErrors] = useState({});

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'create' | 'update' | 'delete'
  const [confirmTargetId, setConfirmTargetId] = useState(null);

  // --- new UI states: search / filter / sort ---
  const [searchText, setSearchText] = useState('');
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt'); // createdAt | name | monthlyFee
  const [sortDir, setSortDir] = useState('desc'); // asc | desc

  useEffect(() => {
    // reset form when not in edit
    if (!isEdit) {
      setForm(defaultForm);
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit]);

  // clear field error when user types
  useEffect(() => {
    setErrors((prev) => {
      const next = { ...prev };
      if (form.name && next.name) delete next.name;
      if (form.description && next.description) delete next.description;
      if (form.monthlyFee !== '' && next.monthlyFee) delete next.monthlyFee;
      if (form.swapAmount !== '' && next.swapAmount) delete next.swapAmount;
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name, form.description, form.monthlyFee, form.swapAmount]);

  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(Number(price));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // special handling: monthlyFee should accept only digits (no decimal)
    if (name === 'monthlyFee') {
      // allow empty string as user clears; otherwise keep only digits
      const str = String(value);
      const sanitized = str === '' ? '' : str.replace(/\D/g, '');
      setForm((p) => ({ ...p, [name]: sanitized }));
      return;
    }

    // swapAmount: allow only digits too (integer)
    if (name === 'swapAmount') {
      const str = String(value);
      const sanitized = str === '' ? '' : str.replace(/\D/g, '');
      setForm((p) => ({ ...p, [name]: sanitized }));
      return;
    }

    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const openEdit = (plan) => {
    setForm({
      planId: plan.planId ?? plan.id ?? null,
      name: plan.name ?? '',
      description: plan.description ?? '',
      monthlyFee: plan.monthlyFee != null ? String(plan.monthlyFee) : plan.monthly_fee != null ? String(plan.monthly_fee) : '',
      swapAmount: plan.swapAmount != null ? String(plan.swapAmount) : plan.swap_amount != null ? String(plan.swap_amount) : '1',
      active: plan.active != null ? plan.active : !!plan.is_active,
    });
    setErrors({});
    setIsEdit(true);
  };

  const validateForm = () => {
    const errs = {};
    const name = (form.name || '').trim();
    const description = (form.description || '').trim();
    if (!name) {
      errs.name = 'Tên gói không được để trống';
    }
    if (!description) {
      errs.description = 'Mô tả không được để trống';
    }

    // monthlyFee must be integer and >= 0
    const monthly = form.monthlyFee === '' ? NaN : Number(form.monthlyFee);
    if (form.monthlyFee === '' || form.monthlyFee == null) {
      errs.monthlyFee = 'Giá thuê không được để trống';
    } else if (Number.isNaN(monthly) || !isFinite(monthly)) {
      errs.monthlyFee = 'Giá thuê phải là số hợp lệ';
    } else if (monthly < 0) {
      errs.monthlyFee = 'Giá thuê phải lớn hơn hoặc bằng 0';
    } else if (!Number.isInteger(monthly)) {
      errs.monthlyFee = 'Giá thuê phải là số nguyên (không nhận thập phân)';
    }

    // swapAmount must be integer and >= 0
    const swap = form.swapAmount === '' ? NaN : Number(form.swapAmount);
    if (form.swapAmount === '' || form.swapAmount == null) {
      errs.swapAmount = 'Số lượt đổi pin không được để trống';
    } else if (Number.isNaN(swap) || !isFinite(swap)) {
      errs.swapAmount = 'Số lượt đổi pin phải là số hợp lệ';
    } else if (swap < 0) {
      errs.swapAmount = 'Số lượt đổi pin phải lớn hơn hoặc bằng 0';
    } else if (!Number.isInteger(swap)) {
      errs.swapAmount = 'Số lượt đổi pin phải là số nguyên';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // validate first
    if (!validateForm()) {
      toast.error('Vui lòng sửa lỗi trên form trước khi tiếp tục');
      return;
    }
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
        swapAmount: Number(form.swapAmount) || 0,
        active: !!form.active,
      };
      await toast.promise(createPlan(payload).unwrap(), {
        loading: 'Đang tạo gói...',
        success: 'Tạo gói thành công',
        error: (err) => err?.data?.message || 'Tạo gói thất bại',
      });

      // Clear form after create (requested)
      setForm(defaultForm);
      setErrors({});
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

      // validate again before sending (safety)
      if (!validateForm()) {
        toast.error('Vui lòng sửa lỗi trên form trước khi cập nhật');
        return;
      }

      const payload = {
        planId,
        name: form.name.trim(),
        description: form.description.trim(),
        monthlyFee: Number(form.monthlyFee) || 0,
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
      setForm(defaultForm);
      setErrors({});
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

  // Derived filtered & sorted plans
  const filteredPlans = useMemo(() => {
    const q = (searchText || '').trim().toLowerCase();

    const matched = plans.filter((p) => {
      if (filterActiveOnly && !p.active && !p.is_active) return false;

      if (!q) return true;

      const name = (p.name || '').toString().toLowerCase();
      const description = (p.description || '').toString().toLowerCase();
      const monthly = String(p.monthlyFee ?? p.monthly_fee ?? '');

      return name.includes(q) || description.includes(q) || monthly.includes(q);
    });

    const cmp = (a, b) => {
      if (sortBy === 'name') {
        const an = (a.name || '').toString().toLowerCase();
        const bn = (b.name || '').toString().toLowerCase();
        return an.localeCompare(bn);
      }
      if (sortBy === 'monthlyFee') {
        const am = Number(a.monthlyFee ?? a.monthly_fee ?? 0);
        const bm = Number(b.monthlyFee ?? b.monthly_fee ?? 0);
        return am - bm;
      }
      // default: createdAt
      const at = new Date(a.createdAt ?? a.created_at ?? a.created_date ?? 0).getTime() || 0;
      const bt = new Date(b.createdAt ?? b.created_at ?? b.created_date ?? 0).getTime() || 0;
      return at - bt;
    };

    const sorted = matched.sort((a, b) => {
      const r = cmp(a, b);
      return sortDir === 'asc' ? r : -r;
    });

    return sorted;
  }, [plans, searchText, filterActiveOnly, sortBy, sortDir]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* hide native scrollbar thumb but keep scroll */}
      <style>{`.hide-scrollbar::-webkit-scrollbar{ display:none } .hide-scrollbar{ -ms-overflow-style:none; scrollbar-width:none }`}</style>

      <h1 className="text-2xl font-bold mb-6 text-gray-800">Quản lý gói thuê pin</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* left: list + filters */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Các gói đã tạo</h2>
          </div>

          {/* controls: search / active filter / sort */}
          <div className="mb-3">
            <div className="flex gap-3 flex-wrap items-center">
              <input
                placeholder="Tìm theo tên, mô tả, giá..."
                value={searchText}
                onChange={(e) => { setSearchText(e.target.value);}}
                className="border rounded px-3 py-2 w-64"
              />

              <select value={filterActiveOnly ? 'active' : ''} onChange={(e) => { setFilterActiveOnly(e.target.value === 'active'); /* reset page if needed */ }} className="border rounded px-3 py-2">
                <option value="">Lọc tất cả trạng thái</option>
                <option value="active">Kích hoạt</option>
                <option value="inactive">Ngưng</option>
              </select>

              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded px-3 py-2">
                <option value="createdAt">Ngày tạo</option>
                <option value="name">Tên gói</option>
                <option value="monthlyFee">Giá thuê</option>
              </select>

              <button onClick={() => setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')} className="px-3 py-2 border rounded">
                {sortDir === 'asc' ? '↑ Tăng dần' : '↓ Giảm dần'}
              </button>

              <button onClick={() => refetch()} className="px-3 py-2 bg-blue-600 text-white rounded">Làm mới</button>
            </div>
          </div>

          {/* list container with max-height + scroll (thumb hidden) */}
          <div className="hide-scrollbar overflow-auto max-h-[60vh]">
            <div className="space-y-4">
              {isLoading && <div className="p-4 text-gray-500">Đang tải...</div>}
              {!isLoading && filteredPlans.length === 0 && (
                <div className="p-4 text-gray-400 bg-white rounded shadow text-center">Không tìm thấy gói nào</div>
              )}

              {!isLoading && filteredPlans.length > 0 && (
                filteredPlans.map((plan) => (
                  <div key={plan.planId || plan.id} className="bg-white rounded-xl shadow p-5 flex flex-col gap-2 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-green-700 text-lg">{plan.name}</div>
                        <div className="text-sm text-gray-500 mt-1 truncate">{plan.description}</div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded-full text-xs font-semibold ${plan.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{plan.active ? 'Kích hoạt' : 'Ngưng'}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                      <span>Giá thuê: <span className="font-semibold">{formatPrice(plan.monthlyFee ?? plan.monthly_fee ?? 0)}</span></span>
                      <span>Số lượt đổi pin: <span className="font-semibold">{plan.swapAmount ?? plan.swap_amount ?? 0}</span></span>
                    </div>

                    <div className="flex gap-2 mt-3 justify-end">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm" onClick={() => openEdit(plan)}>Sửa</button>
                      <button className="px-3 py-1 bg-red-600 text-white rounded text-sm" onClick={() => onDeleteConfirm(plan.planId || plan.id)}>Xóa</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* right: form*/}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">{isEdit ? 'Chỉnh sửa gói thuê pin' : 'Tạo gói thuê pin mới'}</h2>
          <form onSubmit={onSubmit} className="bg-white shadow rounded-2xl p-7 space-y-5 border border-gray-100" noValidate>
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Tên gói</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                aria-invalid={!!errors.name}
                className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 ${errors.name ? 'border-red-400' : ''}`}
                placeholder="VD: Gói tiết kiệm"
              />
              {errors.name && <div className="text-sm text-red-600 mt-1">{errors.name}</div>}
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">Mô tả</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                aria-invalid={!!errors.description}
                rows={3}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Mô tả ngắn về gói thuê..."
              />
              {errors.description && <div className="text-sm text-red-600 mt-1">{errors.description}</div>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Giá thuê (₫)</label>
                <input
                  name="monthlyFee"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.monthlyFee}
                  onChange={handleChange}
                  min={0}
                  step="1"
                  required
                  aria-invalid={!!errors.monthlyFee}
                  className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 ${errors.monthlyFee ? 'border-red-400' : ''}`}
                />
                {errors.monthlyFee && <div className="text-sm text-red-600 mt-1">{errors.monthlyFee}</div>}
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700">Số lượt đổi pin</label>
                <input
                  name="swapAmount"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.swapAmount}
                  onChange={handleChange}
                  min={0}
                  step="1"
                  required
                  aria-invalid={!!errors.swapAmount}
                  className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 ${errors.swapAmount ? 'border-red-400' : ''}`}
                />
                {errors.swapAmount && <div className="text-sm text-red-600 mt-1">{errors.swapAmount}</div>}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
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
                <span className="ml-3 font-semibold text-md text-gray-700">
                  Kích hoạt gói
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating || updating || deleting}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${creating || updating || deleting ? 'bg-green-300 text-white cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
              >
                {isEdit ? 'Cập nhật' : 'Tạo mới'}
              </button>
              {isEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEdit(false);
                    setForm(defaultForm);
                    setErrors({});
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={confirmAction === 'delete' ? 'Xác nhận xóa' : confirmAction === 'update' ? 'Xác nhận cập nhật' : 'Xác nhận tạo'}
        onConfirm={onConfirm}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmTargetId(null);
        }}
        confirmText="Đồng ý"
        cancelText="Hủy"
        isLoading={creating || updating || deleting}
      >
        <div className="text-sm text-gray-700">
          {confirmAction === 'delete' ? (
            <div>Bạn chắc chắn muốn xóa gói <strong>{form.name}</strong>?</div>
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
