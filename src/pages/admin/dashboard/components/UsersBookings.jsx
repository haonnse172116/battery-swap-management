import React, { useMemo, useState } from 'react';
import DateFilter from '@/pages/driver/bookings/components/DateFilter';
import { useGetUsersQuery } from '@/services/userManagement.service';
import { useGetAllBookingsQuery } from '@/services/booking.service';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
} from 'recharts';

/* ---------- Helpers ---------- */

function startOfDayMs(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}
function endOfDayMs(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d.getTime();
}
function daysBetweenInclusive(from, to) {
    const arr = [];
    const cur = new Date(startOfDayMs(from));
    const end = new Date(startOfDayMs(to));
    while (cur.getTime() <= end.getTime()) {
        arr.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
    }
    return arr;
}
function fmtDateLabel(d) {
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Given items with a dateKey field, count per day between from..to (inclusive)
 * Returns array [{ label, count, date }]
 */
function buildSeriesFromRange(items = [], dateKey = 'createdAt', fromDate, toDate) {
    if (!fromDate || !toDate) return [];
    const days = daysBetweenInclusive(fromDate, toDate);
    const series = days.map(d => ({ date: d, label: fmtDateLabel(d), count: 0 }));
    items.forEach(it => {
        const raw = it?.[dateKey];
        if (!raw) return;
        const t = new Date(raw).getTime();
        for (const s of series) {
            if (t >= startOfDayMs(s.date) && t <= endOfDayMs(s.date)) {
                s.count += 1;
                break;
            }
        }
    });
    return series.map(s => ({ label: s.label, count: s.count }));
}

/**
 * derive from dateFilter -> { fromDate, toDate }
 * supported: all, today, this_week, this_month, last_month, custom
 * - all => last 30 days
 */
function resolveDateRange(dateFilter, customFrom, customTo) {
    const now = new Date();
    if (dateFilter === 'today') {
        const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return { fromDate: d0, toDate: d0 };
    }
    if (dateFilter === 'this_week') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const day = today.getDay();
        // make Monday start
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(today.setDate(diff));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        return { fromDate: monday, toDate: sunday };
    }
    if (dateFilter === 'this_month') {
        const first = new Date(now.getFullYear(), now.getMonth(), 1);
        const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { fromDate: first, toDate: last };
    }
    if (dateFilter === 'last_month') {
        const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const last = new Date(now.getFullYear(), now.getMonth(), 0);
        return { fromDate: first, toDate: last };
    }
    if (dateFilter === 'custom') {
        const f = customFrom ? new Date(customFrom) : null;
        const t = customTo ? new Date(customTo) : null;
        if (f && t) return { fromDate: f, toDate: t };
        // fallback to last 7 days
        const fallbackTo = new Date();
        const fallbackFrom = new Date();
        fallbackFrom.setDate(fallbackTo.getDate() - 6);
        return { fromDate: fallbackFrom, toDate: fallbackTo };
    }
    // 'all' or unknown: last 30 days
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 29);
    return { fromDate: from, toDate: to };
}

/* ---------- Avatar small ---------- */
function AvatarSmall({ name, url }) {
    if (url) return <img src={url} alt={name} className="w-10 h-10 rounded-full object-cover" />;
    const initials = name ? name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase() : 'U';
    return <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-700">{initials}</div>;
}

/* ---------- Component ---------- */

export default function UsersBookings() {
    const [page] = useState(1);
    const [pageSize] = useState(200);

    const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({ page, pageSize, search: '', role: 'Driver' });
    const users = usersData?.content || [];

    const { data: bookingsData, isLoading: bookingsLoading } = useGetAllBookingsQuery({ page: 1, size: 1000 });
    const bookings = bookingsData?.content || [];

    // DateFilter state
    const [dateFilter, setDateFilter] = useState('this_week'); // default show this week
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');

    // resolve date range
    const { fromDate, toDate } = resolveDateRange(dateFilter, customFrom, customTo);

    // Filter bookings/users by chosen range for top driver counts
    const bookingsInRange = useMemo(() => {
        const fromMs = startOfDayMs(fromDate);
        const toMs = endOfDayMs(toDate);
        return bookings.filter(b => {
            const t = b?.createdAt ? new Date(b.createdAt).getTime() : null;
            return t && t >= fromMs && t <= toMs;
        });
    }, [bookings, fromDate, toDate]);

    // compute bookings per user within range
    const stats = useMemo(() => {
        const map = {};
        bookingsInRange.forEach(b => {
            const uid = b.userId || b.user_id || b.user?.id;
            if (!uid) return;
            map[uid] = (map[uid] || 0) + 1;
        });
        return map;
    }, [bookingsInRange]);

    // top drivers based on bookings in range
    const usersWithCounts = useMemo(() => {
        return (users || []).map(u => {
            const id = u.userId || u.id || u._id;
            return {
                ...u,
                bookingCount: stats[id] || 0,
            };
        }).sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0));
    }, [users, stats]);

    const topDrivers = usersWithCounts.slice(0, 5);

    // build chart series based on resolved range
    const usersSeries = useMemo(() => buildSeriesFromRange(users, 'createdAt', fromDate, toDate), [users, fromDate, toDate]);
    const bookingsSeries = useMemo(() => buildSeriesFromRange(bookings, 'createdAt', fromDate, toDate), [bookings, fromDate, toDate]);

    const totalUsers = users.length;
    const totalBookings = bookingsInRange.length;

    return (
        <div className="space-y-6">
            {/* Date filter control */}
            <div>
                <DateFilter
                    bookings={(users || []).map(u => ({ ...u, timeSlot: u.createdAt }))}
                    dateFilter={dateFilter}
                    onChangeFilter={(v) => setDateFilter(v)}
                    customDateFrom={customFrom}
                    customDateTo={customTo}
                    setCustomDateFrom={setCustomFrom}
                    setCustomDateTo={setCustomTo}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top drivers card */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">Top tài xế theo số booking</h3>
                        <div className="text-sm text-gray-500">{totalUsers} tài xế</div>
                    </div>

                    <div className="space-y-3">
                        {topDrivers.length === 0 && <div className="text-sm text-gray-500">Không có dữ liệu</div>}

                        {topDrivers.map((u, idx) => (
                            <div key={u.userId || u.id || idx} className="flex items-center justify-between gap-4 p-2 rounded-lg hover:shadow-md transition">
                                <div className="flex items-center gap-3">
                                    <AvatarSmall name={u.fullName} url={u.avatarUrl} />
                                    <div>
                                        <div className="font-medium">{u.fullName || '—'}</div>
                                        <div className="text-xs text-gray-500">{u.email || '—'}</div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1 min-w-[40px]">
                                    <div className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-100 text-blue-700">
                                        {u.bookingCount} yêu cầu
                                    </div>
                                    <div className={`w-6 h-6 flex items-center justify-center rounded-full  ${idx === 0 ? 'bg-yellow-100 text-yellow-900' : 'bg-gray-100 text-gray-700'}`}>
                                        <span className="font-semibold text-[10px]">{idx + 1}</span>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>

                    <div className="mt-4 border-t pt-3 text-xs text-gray-500">
                        Dữ liệu được tính theo khoảng thời gian đã chọn.
                    </div>
                </div>

                {/* Charts summary */}
                <div className="col-span-2 grid grid-cols-1 gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold">Số người đăng ký mới</h3>
                            <div className="text-sm text-gray-500">Tổng (khoảng): <span className="font-semibold">{totalUsers}</span></div>
                        </div>

                        <div style={{ width: '100%', height: 240 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={usersSeries} margin={{ top: 6, right: 12, left: -6, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="label" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="count" stroke="#2563eb" fill="url(#gUsers)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold">Yêu cầu đổi pin (booking requests)</h3>
                            <div className="text-sm text-gray-500">Tổng (khoảng): <span className="font-semibold">{totalBookings}</span></div>
                        </div>

                        <div style={{ width: '100%', height: 240 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={bookingsSeries} margin={{ top: 6, right: 12, left: -6, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="label" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
