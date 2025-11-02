import React from 'react';

const OPTIONS = [
  { key: 'newest',  label: 'Mới nhất',  icon: '📅' },
  { key: 'oldest',  label: 'Cũ nhất',   icon: '📋' },
  { key: 'upcoming',label: 'Sắp tới',   icon: '⏰' },
  { key: 'recent',  label: 'Gần đây',   icon: '🕒' },
];

const SortTabs = ({ sortBy, onChange }) => {
  return (
    <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex flex-wrap">
        {OPTIONS.map((o) => (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className={`px-4 py-3 border-b-2 transition-colors flex-1 min-w-0 ${
              sortBy === o.key
                ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                : 'border-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span>{o.icon}</span>
              <span className="truncate">{o.label}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SortTabs;
