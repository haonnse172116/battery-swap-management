import React, { useMemo, useState } from 'react';
import DateFilter from '@/pages/driver/bookings/components/DateFilter';
import { filterBookingsByDate } from '@/utils/booking';
import { useSelector } from 'react-redux';
import { useGetStationStaffByUserIdQuery } from '@/services/stationStaff.service';
import { useGetAllBookingsQuery } from '@/services/booking.service';
import { useGetStationByIdQuery } from '@/services/station.service';
import { useGetSwapsByStationQuery } from '@/services/batterySwap.service';

// Recharts
import {
    ResponsiveContainer,
    PieChart, Pie, Cell, Tooltip as ReTooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
    AreaChart, Area,
} from 'recharts';

const COLORS = ['#60A5FA', '#34D399', '#F59E0B', '#F87171', '#A78BFA', '#94A3B8'];

function safeDate(v) {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
}

function buildStatusSeries(items) {
    const map = {};
    items.forEach(i => {
        const k = i.status || 'Unknown';
        map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
}

/**
 * buildTimeSeries:
 * - if dateFilter === 'today' => group by hour (0..23)
 * - otherwise group by day (YYYY-MM-DD) within filtered bookings array
 */
function buildTimeSeries(bookings, dateFilter, customFrom, customTo) {
    if (!bookings || bookings.length === 0) return [];

    // convert to items with timestamp
    const items = bookings
        .map(b => {
            const t = b.timeSlot || b.createdAt || b.swappedAt;
            const date = safeDate(t);
            return date ? { ...b, __date: date } : null;
        })
        .filter(Boolean);

    if (items.length === 0) return [];

    if (dateFilter === 'today') {
        const hours = Array.from({ length: 24 }, (_, i) => ({ label: `${i}:00`, count: 0 }));
        items.forEach(it => {
            const h = it.__date.getHours();
            hours[h].count += 1;
        });
        return hours;
    }

    // determine range (use customFrom/customTo if provided)
    let min = items.reduce((m, it) => Math.min(m, it.__date.getTime()), Infinity);
    let max = items.reduce((m, it) => Math.max(m, it.__date.getTime()), -Infinity);

    if (dateFilter === 'custom' && customFrom && customTo) {
        const from = new Date(customFrom); from.setHours(0, 0, 0, 0);
        const to = new Date(customTo); to.setHours(23, 59, 59, 999);
        min = Math.min(min, from.getTime());
        max = Math.max(max, to.getTime());
    }

    // limit to at most 30 days window for readability
    const dayMs = 24 * 60 * 60 * 1000;
    const maxDays = 30;
    const spanDays = Math.min(maxDays, Math.max(1, Math.ceil((max - min) / dayMs)));

    // build list of labels for each day in range
    const start = new Date(min);
    start.setHours(0, 0, 0, 0);

    const seriesMap = {};
    for (let i = 0; i <= spanDays; i += 1) {
        const d = new Date(start.getTime() + i * dayMs);
        const key = d.toISOString().slice(0, 10);
        seriesMap[key] = { label: d.toLocaleDateString('vi-VN'), count: 0, key };
    }

    items.forEach(it => {
        const k = it.__date.toISOString().slice(0, 10);
        if (seriesMap[k]) seriesMap[k].count += 1;
    });

    return Object.values(seriesMap);
}

export default function StaffDashboard() {
    const userId = useSelector((s) => s.auth.user?.userId || s.auth.user?.id || null);
    const { data: stationStaffRes } = useGetStationStaffByUserIdQuery(userId, { skip: !userId });
    const stationId = stationStaffRes?.content?.stationId || (Array.isArray(stationStaffRes?.content) ? stationStaffRes.content[0]?.stationId : null) || null;

    const { data: stationRes } = useGetStationByIdQuery(stationId ? { id: stationId } : null, { skip: !stationId });

    const { data: swapsData } = useGetSwapsByStationQuery(stationId ? { stationId, page: 1, pageSize: 1000 } : null, { skip: !stationId });
    const swaps = swapsData?.content || [];

    const { data: bookingsData, isLoading } = useGetAllBookingsQuery({ page: 1, size: 1000, search: '' }, { skip: false });
    const allBookings = bookingsData?.content || [];

    const [dateFilter, setDateFilter] = useState('all');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');

    // Only bookings for this station
    const stationBookings = useMemo(() => allBookings.filter(b => String(b.stationId || b.station_id || '') === String(stationId)), [allBookings, stationId]);

    // create objects with timeSlot for DateFilter
    const bookingsForDate = stationBookings.map((b) => ({ ...b, timeSlot: b.swappedAt || b.createdAt || null }));

    // filtered by date range selected
    const bookingsFiltered = useMemo(() => filterBookingsByDate(bookingsForDate, dateFilter, customFrom, customTo), [bookingsForDate, dateFilter, customFrom, customTo]);

    // charts data
    const bookingStatusSeries = useMemo(() => buildStatusSeries(bookingsFiltered), [bookingsFiltered]);
    const swapStatusSeries = useMemo(() => buildStatusSeries(swaps), [swaps]);

    const areaSeries = useMemo(() => buildTimeSeries(bookingsFiltered, dateFilter, customFrom, customTo), [bookingsFiltered, dateFilter, customFrom, customTo]);

    // recent
    const recent = useMemo(() => bookingsFiltered.slice().sort((a, b) => new Date(b.createdAt || b.swappedAt || 0) - new Date(a.createdAt || a.swappedAt || 0)).slice(0, 6), [bookingsFiltered]);

    return (
        <div className="p-6 min-h-screen">
            <h1 className="text-2xl font-semibold mb-4">Bảng điều khiển trạm (Trạm: {stationRes?.content?.stationName || stationRes?.content?.name || '[lỗi lấy tên]'})</h1>

            <div className="ml-auto">
                <DateFilter
                    bookings={bookingsForDate}
                    dateFilter={dateFilter}
                    onChangeFilter={(v) => setDateFilter(v)}
                    customDateFrom={customFrom}
                    customDateTo={customTo}
                    setCustomDateFrom={setCustomFrom}
                    setCustomDateTo={setCustomTo}
                />
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column: Pie (booking status) and Bar (swap status) */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl p-4 shadow border">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <div className="text-sm text-gray-500">Trạng thái yêu cầu (Bookings)</div>
                                <div className="text-lg font-semibold">{bookingsFiltered.length} yêu cầu</div>
                            </div>
                        </div>

                        <div style={{ width: '100%', height: 260 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={bookingStatusSeries}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={80}
                                        innerRadius={36}
                                        paddingAngle={4}
                                        label={(entry) => `${entry.name} (${entry.value})`}
                                    >
                                        {bookingStatusSeries.map((entry, idx) => <Cell key={`c-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
                                    </Pie>
                                    <ReTooltip formatter={(v) => [v, 'Số lượng']} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow border">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <div className="text-sm text-gray-500">Trạng thái giao dịch (Swaps)</div>
                                <div className="text-lg font-semibold">{swaps.length} giao dịch</div>
                            </div>
                        </div>

                        <div style={{ width: '100%', height: 220 }}>
                            <ResponsiveContainer>
                                <BarChart data={swapStatusSeries}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <ReTooltip />
                                    <Bar dataKey="value" fill={COLORS[1]}>
                                        {swapStatusSeries.map((entry, idx) => <Cell key={`b-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Middle/Right: Area chart */}
                <div className="lg:col-span-2 bg-white rounded-xl p-4 shadow border">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <div className="text-sm text-gray-500">Số yêu cầu theo thời gian</div>
                            <div className="text-lg font-semibold">Phân bố: {areaSeries.length} mốc</div>
                        </div>
                        <div className="text-sm text-gray-500">(Mốc: {dateFilter === 'today' ? 'Giờ' : 'Ngày'})</div>
                    </div>

                    <div style={{ width: '100%', height: 320 }}>
                        <ResponsiveContainer>
                            <AreaChart data={areaSeries}>
                                <defs>
                                    <linearGradient id="colorCnt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                <YAxis allowDecimals={false} />
                                <ReTooltip />
                                <Area type="monotone" dataKey="count" stroke="#2563EB" fill="url(#colorCnt)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* small summary row */}
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-gray-50 p-3 rounded">
                            <div className="text-xs text-gray-500">Tổng yêu cầu (mốc)</div>
                            <div className="text-lg font-semibold">{bookingsFiltered.length}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                            <div className="text-xs text-gray-500">Tổng giao dịch (trạm)</div>
                            <div className="text-lg font-semibold">{swaps.length}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                            <div className="text-xs text-gray-500">Trạng thái phổ biến</div>
                            <div className="text-lg font-semibold">{bookingStatusSeries[0]?.name || '-'}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                            <div className="text-xs text-gray-500">Giao dịch phổ biến</div>
                            <div className="text-lg font-semibold">{swapStatusSeries[0]?.name || '-'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent small list (kept minimal) */}
            <div className="mt-6 bg-white rounded-xl p-4 shadow border">
                <h3 className="font-semibold mb-3">Yêu cầu mới nhất</h3>
                {isLoading ? <div>Đang tải...</div> : recent.length === 0 ? <div className="text-gray-500">Không có dữ liệu</div> : (
                    <div className="grid gap-2">
                        {recent.map(r => (
                            <div key={r.bookingId || r.id} className="p-3 rounded border flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium">#{r.bookingId || r.id} — {r.userName || r.user?.name || '—'}</div>
                                    <div className="text-xs text-gray-500">{r.licensePlate || r.vehicle?.license_plate || '—'} • {new Date(r.createdAt || r.swappedAt || r.timeSlot || 0).toLocaleString()}</div>
                                </div>
                                <div className="text-sm font-semibold">{r.status}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
