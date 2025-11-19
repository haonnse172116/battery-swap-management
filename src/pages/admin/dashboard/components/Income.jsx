import React, { useMemo, useState } from 'react';
import DateFilter from '@/pages/driver/bookings/components/DateFilter';
import { useGetPaymentManagementAllQuery, useGetPaymentManagementByStationQuery } from '@/services/paymentManagement.service';
import { useGetStationsQuery } from '@/services/station.service';
import ConfirmModal from '@/components/common/ConfirmModal.jsx';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip as ReTooltip,
    Legend,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';

/* ---------- Helpers ---------- */

const STATUS_KEYS = ['Pending', 'Completed', 'Failed', 'Cancelled'];

const COLORS = {
    Pending: '#f59e0b', // amber-500
    Completed: '#10b981', // green-500
    Failed: '#ef4444', // red-500
    Cancelled: '#6b7280', // gray-500
    Other: '#3b82f6', // blue-500
};

const fmtVND = (n) => {
    if (!n && n !== 0) return '-';
    return new Intl.NumberFormat('vi-VN').format(n) + ' ₫';
};

function startOfDay(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}
function endOfDay(d) {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
}

/**
 * Filter payments array by dateFilter/customFrom/customTo (based on payment.createdAt)
 */
function filterPaymentsByDate(payments = [], dateFilter = 'all', customFrom = '', customTo = '') {
    if (!Array.isArray(payments) || payments.length === 0) return [];

    const now = new Date();
    const today = startOfDay(now);

    const parseTime = (t) => {
        if (!t) return null;
        const d = new Date(t);
        return isNaN(d.getTime()) ? null : d;
    };

    if (dateFilter === 'all') return payments;

    if (dateFilter === 'today') {
        const from = today.getTime();
        const to = endOfDay(today).getTime();
        return payments.filter(p => {
            const t = parseTime(p.createdAt);
            return t && t.getTime() >= from && t.getTime() <= to;
        });
    }

    if (dateFilter === 'this_week') {
        // Monday as start
        const cur = new Date(today);
        const day = cur.getDay(); // 0..6 Sun..Sat
        const diff = cur.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(cur.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        return payments.filter(p => {
            const t = parseTime(p.createdAt);
            return t && t >= monday && t <= sunday;
        });
    }

    if (dateFilter === 'this_month') {
        const m = new Date();
        const start = new Date(m.getFullYear(), m.getMonth(), 1, 0, 0, 0, 0);
        const end = new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59, 999);
        return payments.filter(p => {
            const t = parseTime(p.createdAt);
            return t && t >= start && t <= end;
        });
    }

    if (dateFilter === 'last_month') {
        const m = new Date();
        const start = new Date(m.getFullYear(), m.getMonth() - 1, 1, 0, 0, 0, 0);
        const end = new Date(m.getFullYear(), m.getMonth(), 0, 23, 59, 59, 999);
        return payments.filter(p => {
            const t = parseTime(p.createdAt);
            return t && t >= start && t <= end;
        });
    }

    if (dateFilter === 'custom') {
        if (!customFrom || !customTo) return [];
        const from = startOfDay(new Date(customFrom)).getTime();
        const to = endOfDay(new Date(customTo)).getTime();
        return payments.filter(p => {
            const t = parseTime(p.createdAt);
            return t && t.getTime() >= from && t.getTime() <= to;
        });
    }

    return payments;
}

/**
 * Build pie data aggregated by status
 */
function buildStatusPieData(payments = []) {
    const map = {};
    payments.forEach(p => {
        const s = (p.status || 'Other');
        map[s] = (map[s] || 0) + 1;
    });

    // Ensure we show main status keys in order + others
    const data = [];
    STATUS_KEYS.forEach(k => {
        if (map[k]) data.push({ name: k, value: map[k] });
    });

    const otherCount = Object.entries(map)
        .filter(([k]) => !STATUS_KEYS.includes(k))
        .reduce((s, [, v]) => s + v, 0);

    if (otherCount > 0) data.push({ name: 'Other', value: otherCount });
    return data;
}

/**
 * Build area data according to dateFilter
 * returns array [{ label: 'Mon', amount: 123 }, ...]
 */
function buildAreaData(payments = [], dateFilter = 'all', customFrom = '', customTo = '') {
    // payments are already filtered by dateFilter when passed here; but we will bucket them
    const parseTime = (t) => {
        if (!t) return null;
        const d = new Date(t);
        return isNaN(d.getTime()) ? null : d;
    };

    if (!payments || payments.length === 0) {
        return [];
    }

    const now = new Date();

    if (dateFilter === 'today') {
        // hourly buckets 0..23
        const hours = Array.from({ length: 24 }, (_, i) => ({ label: `${i}:00`, amount: 0 }));
        payments.forEach(p => {
            const t = parseTime(p.createdAt);
            if (!t) return;
            const h = t.getHours();
            hours[h].amount += Number(p.amount || 0);
        });
        return hours;
    }

    if (dateFilter === 'this_week') {
        // Monday .. Sunday
        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const monday = (() => {
            const d = startOfDay(now);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            const m = new Date(d.setDate(diff));
            m.setHours(0, 0, 0, 0);
            return m;
        })();
        const buckets = weekDays.map((label, idx) => ({ label, date: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + idx), amount: 0 }));
        payments.forEach(p => {
            const t = parseTime(p.createdAt);
            if (!t) return;
            for (let b of buckets) {
                const sd = startOfDay(b.date).getTime();
                const ed = endOfDay(b.date).getTime();
                if (t.getTime() >= sd && t.getTime() <= ed) {
                    b.amount += Number(p.amount || 0);
                    break;
                }
            }
        });
        return buckets.map(b => ({ label: b.label, amount: b.amount }));
    }

    if (dateFilter === 'this_month' || dateFilter === 'last_month' || dateFilter === 'custom') {
        // bucket by day
        let start, end;
        if (dateFilter === 'this_month') {
            const m = new Date(now.getFullYear(), now.getMonth(), 1);
            start = startOfDay(m);
            end = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
        } else if (dateFilter === 'last_month') {
            const m = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            start = startOfDay(m);
            end = endOfDay(new Date(m.getFullYear(), m.getMonth() + 1, 0));
        } else { // custom
            if (!customFrom || !customTo) return [];
            start = startOfDay(new Date(customFrom));
            end = endOfDay(new Date(customTo));
        }

        const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const buckets = Array.from({ length: dayCount }, (_, i) => {
            const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
            return { label: `${d.getDate()}/${d.getMonth() + 1}`, date: d, amount: 0 };
        });

        payments.forEach(p => {
            const t = parseTime(p.createdAt);
            if (!t) return;
            for (let b of buckets) {
                const sd = startOfDay(b.date).getTime();
                const ed = endOfDay(b.date).getTime();
                if (t.getTime() >= sd && t.getTime() <= ed) {
                    b.amount += Number(p.amount || 0);
                    break;
                }
            }
        });

        return buckets.map(b => ({ label: b.label, amount: b.amount }));
    }

    // default (all) -> group by month-year for last 6 months (or months present)
    {
        // collect months keys
        const map = {};
        payments.forEach(p => {
            const t = parseTime(p.createdAt);
            if (!t) return;
            const key = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`;
            map[key] = (map[key] || 0) + Number(p.amount || 0);
        });
        const keys = Object.keys(map).sort();
        return keys.map(k => {
            const [yr, mo] = k.split('-');
            const label = `${mo}/${yr}`;
            return { label, amount: map[k] };
        });
    }
}

/* ---------- Component ---------- */

export default function Income() {
    const [dateFilter, setDateFilter] = useState('all');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');

    const { data: stationsData } = useGetStationsQuery({ page: 1, pageSize: 200 });
    const stations = stationsData?.content || [];

    const { data: paymentsData, isLoading } = useGetPaymentManagementAllQuery({ page: 1, pageSize: 500 });
    const payments = paymentsData?.content || [];

    const [selectedStation, setSelectedStation] = useState(null);
    const { data: stationPaymentsData, refetch: refetchStationPayments } = useGetPaymentManagementByStationQuery(
        { stationId: selectedStation?.stationId || selectedStation?.id || '' },
        { skip: !selectedStation }
    );
    const stationPayments = stationPaymentsData?.content || [];

    const paymentMethod =
        stationPaymentsData?.content?.paymentMethod ||
        stationPaymentsData?.paymentMethod ||
        '—';

    // helper translate payment method to user-friendly label
    const getPaymentMethodLabel = (method) => {
        if (!method || method === '—') return 'Chưa có phương thức thanh toán';
        const m = String(method).toLowerCase();
        if (m === 'Card') {
            return 'Thanh toán bằng e-bank/QR';
        }
        if (m === 'Subscription_Plan') {
            return 'Thanh toán bằng gói đăng ký';
        }
        // fallback: giữ nguyên tên nhưng đưa ra mô tả chung
        return `${method}`;
    };

    // payments filtered by dateFilter
    const paymentsFiltered = useMemo(() => filterPaymentsByDate(payments, dateFilter, customFrom, customTo), [payments, dateFilter, customFrom, customTo]);

    // pie data (status counts)
    const pieData = useMemo(() => buildStatusPieData(paymentsFiltered), [paymentsFiltered]);

    // area data (time series)
    const areaData = useMemo(() => buildAreaData(paymentsFiltered, dateFilter, customFrom, customTo), [paymentsFiltered, dateFilter, customFrom, customTo]);

    const totalSum = paymentsFiltered.reduce((s, p) => s + (Number(p.amount) || 0), 0);

    return (
        <div>
            <DateFilter
                bookings={payments.map(p => ({ ...p, timeSlot: p.createdAt }))}
                dateFilter={dateFilter}
                onChangeFilter={setDateFilter}
                customDateFrom={customFrom}
                customDateTo={customTo}
                setCustomDateFrom={setCustomFrom}
                setCustomDateTo={setCustomTo}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-1 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="font-semibold mb-3">Trạm</h3>
                    <div className="space-y-2 max-h-[60vh] overflow-auto">
                        {stations.map(s => (
                            <div key={s.stationId || s.id} className="flex items-center justify-between border p-2 rounded hover:shadow-sm transition">
                                <div>
                                    <div className="font-semibold">{s.name || s.stationName}</div>
                                    <div className="text-xs text-gray-500">{s.address}</div>
                                </div>
                                <div>
                                    <button
                                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                        onClick={() => setSelectedStation(s)}
                                    >
                                        Chi tiết
                                    </button>
                                </div>
                            </div>
                        ))}
                        {stations.length === 0 && <div className="text-sm text-gray-500">Không tìm thấy trạm</div>}
                    </div>
                </div>

                <div className="col-span-2 grid grid-cols-1 gap-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">Thống kê trạng thái đơn hàng</h3>
                            <div className="text-sm text-gray-600">Tổng (mốc hiện tại): <span className="font-semibold text-green-700">{fmtVND(totalSum)}</span></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <div className="col-span-2">
                                <div className="text-sm text-gray-600 mb-2">Phân bố số lượng theo trạng thái</div>
                                <div style={{ width: '100%', height: 240 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={4}
                                                label={(entry) => `${entry.name} (${entry.value})`}
                                            >
                                                {pieData.map((entry, idx) => {
                                                    const col = COLORS[entry.name] || COLORS.Other;
                                                    return <Cell key={`c-${idx}`} fill={col} />;
                                                })}
                                            </Pie>
                                            <ReTooltip formatter={(v) => [`${v}`, 'Số lượng']} />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="col-span-1 bg-gray-50 p-3 rounded border">
                                <div className="text-xs text-gray-600 mb-2">Chi tiết</div>
                                <div className="space-y-2">
                                    {pieData.map(pd => (
                                        <div key={pd.name} className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div style={{ width: 12, height: 12, background: COLORS[pd.name] || COLORS.Other }} className="rounded-sm" />
                                                <div className="text-sm">{pd.name}</div>
                                            </div>
                                            <div className="text-sm font-semibold">{pd.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="font-semibold mb-3">Thu nhập theo thời gian</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={areaData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="label" />
                                    <YAxis tickFormatter={(v) => (v ? `${(v / 1000) | 0}k` : '0')} />
                                    <ReTooltip formatter={(value) => fmtVND(value)} />
                                    <Area type="monotone" dataKey="amount" stroke="#0ea5e9" fill="url(#colorAmt)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-xs text-gray-500 mt-3">Lưu ý: trục hoành thay đổi theo mốc thời gian (giờ / ngày / tháng).</div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                open={!!selectedStation}
                title={`Chi tiết trạm ${selectedStation?.name || selectedStation?.stationName || ''}`}
                onConfirm={() => { refetchStationPayments(); setSelectedStation(null); }}
                onCancel={() => setSelectedStation(null)}
                confirmText="Đóng"
            >
                <div>
                    <h4 className="font-semibold mb-2">Doanh thu</h4>
                    <div className="mb-2">Tổng: {fmtVND(stationPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0))}</div>
                    <div className="space-y-2 max-h-[50vh] overflow-auto">
                        {stationPayments.map(sp => (
                            <div key={sp.payId} className="p-2 border rounded flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <img src={sp.avatarUrl} alt={sp.fullName} className="w-10 h-10 rounded-full object-cover" />
                                    <div>
                                        <div className="font-semibold">{sp.fullName}</div>
                                        <div className="text-xs text-gray-500">{getPaymentMethodLabel(paymentMethod)}</div>
                                        <div className="text-xs text-gray-500">{new Date(sp.createdAt).toLocaleString()}</div>
                                    </div>
                                </div>
                                <div className="font-semibold text-green-700">{fmtVND(Number(sp.amount) || 0)}</div>
                            </div>
                        ))}
                        {stationPayments.length === 0 && <div className="text-sm text-gray-500">Không có giao dịch</div>}
                    </div>
                </div>
            </ConfirmModal>
        </div>
    );
}
