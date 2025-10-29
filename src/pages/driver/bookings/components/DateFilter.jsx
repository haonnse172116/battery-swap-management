import React from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { filterBookingsByDate } from '../../../../utils/booking';

const DateFilter = ({
  bookings,
  dateFilter,
  onChangeFilter,
  customDateFrom,
  customDateTo,
  setCustomDateFrom,
  setCustomDateTo,
}) => {
  const COUNT = (key) =>
    filterBookingsByDate(bookings, key, customDateFrom, customDateTo).length;

  const OPTIONS = [
    { key: 'all',        label: 'Tất cả',    count: bookings.length },
    { key: 'today',      label: 'Hôm nay',   count: COUNT('today') },
    { key: 'this_week',  label: 'Tuần này',  count: COUNT('this_week') },
    { key: 'this_month', label: 'Tháng này', count: COUNT('this_month') },
    { key: 'last_month', label: 'Tháng trước', count: COUNT('last_month') },
    { key: 'custom',     label: 'Tùy chọn',  count: dateFilter === 'custom' ? COUNT('custom') : 0 },
  ];

  return (
    <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <FunnelIcon className="w-5 h-5 text-gray-600" />
        <h3 className="font-medium text-gray-900">Lọc theo thời gian</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
        {OPTIONS.map((o) => (
          <button
            key={o.key}
            onClick={() => onChangeFilter(o.key)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              dateFilter === o.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="text-center">
              <div>{o.label}</div>
              <div className="text-xs opacity-75">({o.count})</div>
            </div>
          </button>
        ))}
      </div>

      {dateFilter === 'custom' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Từ ngày
            </label>
            <input
              type="date"
              value={customDateFrom}
              onChange={(e) => setCustomDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đến ngày
            </label>
            <input
              type="date"
              value={customDateTo}
              onChange={(e) => setCustomDateTo(e.target.value)}
              min={customDateFrom}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DateFilter;
