import React, { useState } from "react";

const mockSubscriptions = [
  {
    id: 1,
    name: "Gói tiết kiệm",
    description: "Phù hợp cho nhu cầu cơ bản, giá rẻ.",
    monthly_fee: 120000,
    swapAmount: 2,
    active: true,
  },
  {
    id: 2,
    name: "Gói linh hoạt",
    description: "Đổi pin nhiều lần, phù hợp di chuyển nhiều.",
    monthly_fee: 180000,
    swapAmount: 5,
    active: true,
  },
  {
    id: 3,
    name: "Gói cao cấp",
    description: "Ưu đãi đặc biệt, dịch vụ tốt nhất.",
    monthly_fee: 250000,
    swapAmount: 10,
    active: false,
  },
];

const SubscriptionCreate = () => {
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
  const [form, setForm] = useState({
    id: null,
    name: "",
    description: "",
    monthly_fee: "",
    swapAmount: 1,
    active: true,
  });
  const [isEdit, setIsEdit] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      setSubscriptions(subs => subs.map(s => s.id === form.id ? { ...form, monthly_fee: Number(form.monthly_fee), swapAmount: Number(form.swapAmount) } : s));
      alert("Đã cập nhật gói thuê pin!");
    } else {
      const newSub = {
        ...form,
        id: Date.now(),
        monthly_fee: Number(form.monthly_fee),
        swapAmount: Number(form.swapAmount),
      };
      setSubscriptions(subs => [...subs, newSub]);
      alert("Gói thuê pin đã được tạo!");
    }
    setForm({ id: null, name: "", description: "", monthly_fee: "", swapAmount: 1, active: true });
    setIsEdit(false);
  };

  const handleEdit = (sub) => {
    setForm({ ...sub, monthly_fee: sub.monthly_fee.toString(), swapAmount: sub.swapAmount });
    setIsEdit(true);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Quản lý gói thuê pin</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Danh sách gói thuê pin */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Các gói đã tạo</h2>
          <div className="space-y-4">
            {subscriptions.length === 0 ? (
              <div className="p-4 text-gray-400 bg-white rounded shadow text-center">Chưa có gói nào</div>
            ) : (
              subscriptions.map(sub => (
                <div key={sub.id} className="bg-white rounded-xl shadow p-5 flex flex-col gap-2 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-green-700 text-lg">{sub.name}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sub.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{sub.active ? 'Kích hoạt' : 'Ngưng'}</span>
                  </div>
                  <div className="text-gray-600 text-sm mb-1">{sub.description}</div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                    <span>Giá thuê: <span className="font-semibold">{sub.monthly_fee.toLocaleString()} VNĐ</span></span>
                    <span>Số lượt đổi pin: <span className="font-semibold">{sub.swapAmount}</span></span>
                  </div>
                  <button
                    className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm self-end"
                    onClick={() => handleEdit(sub)}
                  >Sửa</button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Form tạo/sửa gói thuê pin */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">{isEdit ? 'Chỉnh sửa gói thuê pin' : 'Tạo gói thuê pin mới'}</h2>
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow rounded-2xl p-7 space-y-5 border border-gray-100"
          >
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Tên gói</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="VD: Gói tiết kiệm"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">Mô tả</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Mô tả ngắn về gói thuê..."
                rows={3}
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Giá thuê (VNĐ)</label>
                <input
                  type="number"
                  name="monthly_fee"
                  value={form.monthly_fee}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="VD: 150000"
                  min={0}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Số lượt đổi pin</label>
                <input
                  type="number"
                  name="swapAmount"
                  value={form.swapAmount}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                  min={1}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="w-4 h-4 accent-green-600"
              />
              <label className="font-semibold text-gray-700">Kích hoạt gói này</label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold"
              >{isEdit ? 'Cập nhật' : 'Tạo mới'}</button>
              {isEdit && (
                <button
                  type="button"
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
                  onClick={() => { setForm({ id: null, name: '', description: '', monthly_fee: '', swapAmount: 1, active: true }); setIsEdit(false); }}
                >Hủy</button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCreate;
