import React, { useMemo, useState } from 'react';
import { useGetSubscriptionPurchasesQuery } from '@/services/subcription.service';
import { useGetSubscriptionPlansQuery } from '@/services/subcriptionPlan.service';

// Small helpers
function classNames(...args) { return args.filter(Boolean).join(' '); }

// Avatar component
function Avatar({ name, url }) {
  if (url) return <img src={url} alt={name} className="w-8 h-8 rounded-full object-cover" />;
  const initials = name ? name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase() : 'U';
  return (
    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-700">{initials}</div>
  );
}

// Simple Modal 
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-4xl mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button className="text-gray-600 hover:font-semibold px-2 py-1" onClick={onClose}>✕</button>
        </div>
        <div className="p-4 max-h-[70vh] overflow-auto">{children}</div>
      </div>
    </div>
  );
}

export default function SubscriptionList() {
  // get plans
  const { data: plansData, isLoading: plansLoading, refetch: refetchPlans } = useGetSubscriptionPlansQuery({ page: 1, pageSize: 200 });
  const plans = plansData?.content || [];

  // get purchases
  const { data: purchasesData, isLoading: purchasesLoading, refetch: refetchPurchases } = useGetSubscriptionPurchasesQuery();
  const purchases = purchasesData?.content || [];

  // UI states
  const [searchText, setSearchText] = useState('');
  const [filterActiveOnly, setFilterActiveOnly] = useState(true); // Mặc định lọc gói kích hoạt
  const [sortBy, setSortBy] = useState('createdAt'); // createdAt | name | monthlyFee
  const [sortDir, setSortDir] = useState('desc');

  // Modal
  const [openPlanId, setOpenPlanId] = useState(null);

  // derived: counts of subscribers per plan
  const subscribersByPlan = useMemo(() => {
    const map = {};
    purchases.forEach((p) => {
      const id = p.planId ?? p.planInfo?.planId;
      if (!id) return;
      map[id] = map[id] || [];
      map[id].push(p);
    });
    return map;
  }, [purchases]);

  // Filtered & sorted plans for table
  const filteredPlans = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    const matched = plans.filter((pl) => {
      if (filterActiveOnly && !pl.active) return false;
      if (!q) return true;
      const name = (pl.name || '').toLowerCase();
      const desc = (pl.description || '').toLowerCase();
      const price = String(pl.monthlyFee ?? pl.monthly_fee ?? '');
      return name.includes(q) || desc.includes(q) || price.includes(q);
    });

    const cmp = (a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'monthlyFee') return Number(a.monthlyFee ?? a.monthly_fee ?? 0) - Number(b.monthlyFee ?? b.monthly_fee ?? 0);
      // createdAt
      const at = new Date(a.createdAt ?? a.created_at ?? 0).getTime() || 0;
      const bt = new Date(b.createdAt ?? b.created_at ?? 0).getTime() || 0;
      return at - bt;
    };

    return matched.sort((a, b) => (sortDir === 'asc' ? cmp(a, b) : -cmp(a, b)));
  }, [plans, searchText, filterActiveOnly, sortBy, sortDir]);

  // render subscriber rows for modal
  const renderSubscribers = (planId) => {
    const list = subscribersByPlan[planId] || [];

    if (list.length === 0) return <div className="text-sm text-gray-500">Không có người đăng ký.</div>;

    return (
      <div className="overflow-auto max-h-[40vh] hide-scrollbar">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-left text-xs text-gray-600 border-b">
              <th className="py-2">Người dùng</th>
              <th className="py-2">Email</th>
              <th className="py-2">Hiệu lực</th>
              <th className="py-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => {
              // Tính số ngày còn lại
              const startDate = p.startDate ? new Date(p.startDate) : null;
              const endDate = p.endDate ? new Date(p.endDate) : null;
              let daysRemaining = '-';
              if (startDate && endDate) {
                const now = new Date();
                const diffMs = endDate.getTime() - now.getTime();
                const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                daysRemaining = diffDays > 0 ? `${diffDays} ngày` : 'Đã hết hạn';
              }

              return (
                <tr key={p.subscriptionId} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="py-2 flex items-center gap-3">
                    <Avatar name={p.userFullName} url={p.userAvatarUrl} />
                    <div>
                      <div className="font-medium">{p.userFullName || '—'}</div>
                      <div className="text-xs text-gray-500">ID: {p.userId}</div>
                    </div>
                  </td>
                  <td className="py-2 text-sm">{p.userEmail || '—'}</td>
                  <td className="py-2 text-sm">
                    <div className="font-medium">{daysRemaining}</div>
                    <div className="text-xs text-gray-500">
                      {startDate && endDate ? `${startDate.toLocaleDateString('vi-VN')} - ${endDate.toLocaleDateString('vi-VN')}` : '-'}
                    </div>
                  </td>
                  <td className="py-3 text-sm">
                    <span className={classNames('px-2 py-1 rounded-full text-xs font-medium', p.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700')}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <style>{`.hide-scrollbar::-webkit-scrollbar{ display:none } .hide-scrollbar{ -ms-overflow-style:none; scrollbar-width:none }`}</style>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Danh sách gói & Người đăng ký</h1>
      </div>

      <div className="flex gap-3 flex-wrap items-center mb-6">
        <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Tìm theo tên hoặc mô tả..." className="border rounded px-3 py-2 w-64" />
        <select value={filterActiveOnly ? 'active' : ''} onChange={(e) => setFilterActiveOnly(e.target.value === 'active')} className="border rounded px-3 py-2">
          <option value="">Lọc tất cả trạng thái</option>
          <option value="active">Chỉ gói kích hoạt</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded px-3 py-2">
          <option value="createdAt">Ngày tạo</option>
          <option value="name">Tên</option>
          <option value="monthlyFee">Giá thuê</option>
        </select>
        <button onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))} className="px-3 py-2 border rounded">{sortDir === 'asc' ? '↑ Tăng dần' : '↓ Giảm dần'}</button>
        <button onClick={() => { refetchPlans(); refetchPurchases(); }} className="px-3 py-2 bg-blue-600 text-white rounded">Làm mới</button>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-medium">Danh sách gói đăng ký</div>
          <div className="text-sm text-gray-500">Hiển thị: {filteredPlans.length} / {plans.length}</div>
        </div>

        <div className="overflow-auto hide-scrollbar max-h-[540px]">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-sm text-gray-600 border-b">
                <th className="px-4 py-3">Tên gói</th>
                <th className="px-4 py-3">Giá thuê</th>
                <th className="px-4 py-3">Người đăng ký</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {plansLoading || purchasesLoading ? (
                <tr><td colSpan={5} className="p-6 text-center text-gray-500">Đang tải...</td></tr>
              ) : filteredPlans.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-gray-500">Không có gói phù hợp</td></tr>
              ) : (
                filteredPlans.map((pl) => {
                  const id = pl.planId ?? pl.id;
                  const subs = subscribersByPlan[id] || [];

                  return (
                    <tr key={id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{pl.name}</div>
                        <div className="text-xs text-gray-500 truncate">{pl.description}</div>
                      </td>
                      <td className="px-4 py-3">{new Intl.NumberFormat('vi-VN').format(pl.monthlyFee ?? pl.monthly_fee ?? 0)} ₫</td>
                      <td className="px-4 py-3">
                        <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold inline-block">{subs.length}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {pl.active ? <span className="px-2 py-1 rounded-full font-medium bg-emerald-100 text-emerald-700">Kích hoạt</span> : <span className="text-red-600 bg-red-100 ">Ngưng</span>}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setOpenPlanId(id)} className="px-3 py-1 bg-indigo-600 text-white rounded">Xem chi tiết</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!openPlanId} onClose={() => setOpenPlanId(null)} title={`Chi tiết gói`}>
        {openPlanId && (
          <div>
            {(() => {
              const plan = plans.find(p => (p.planId ?? p.id) === openPlanId);
              const subsAll = subscribersByPlan[openPlanId] || [];
              if (!plan) return <div>Không tìm thấy gói</div>;

              return (
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{plan.description}</p>

                      <div className="mt-4 flex items-center gap-4">
                        <div className="text-2xl font-extrabold">{new Intl.NumberFormat('vi-VN').format(plan.monthlyFee ?? plan.monthly_fee ?? 0)} ₫</div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500 text-right">
                      <div className={classNames('px-2 py-1 mb-2 rounded-full text-sm font-medium', plan.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700')}>
                        {plan.active ? 'Kích hoạt' : 'Ngưng'}
                      </div>
                      <div>Ngày tạo</div>
                      <div className="font-medium text-gray-700">{new Date(plan.createdAt ?? plan.created_at ?? Date.now()).toLocaleDateString('vi-VN')}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Người đăng ký ({subsAll.length})</h4>
                    {renderSubscribers(openPlanId)}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
}