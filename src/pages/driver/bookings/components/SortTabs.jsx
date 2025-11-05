import React from 'react';

const OPTIONS = [
  { key: 'newest',  label: 'Mới nhất',  icon: '📅' },
  { key: 'oldest',  label: 'Cũ nhất',   icon: '📋' },
  { key: 'upcoming',label: 'Sắp tới',   icon: '⏰' },
  { key: 'recent',  label: 'Gần đây',   icon: '🕒' },
];

const SortTabs = ({ sortBy, setSortBy, stats }) => { 
  return (
    <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex flex-wrap">
        {OPTIONS.map(option => (
          <button
            key={option.key}
            onClick={() => setSortBy(option.key)} 
            className={`px-4 py-3 border-r border-gray-100 last:border-r-0 transition-colors flex-1 min-w-0 ${
              sortBy === option.key
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'hover:bg-gray-50 text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span>{option.icon}</span>
              <span className="truncate">{option.label}</span>
              {/* ✅ Show count for upcoming */}
              {option.key === 'upcoming' && stats && (
                <span className="text-xs opacity-75">({stats.upcoming})</span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SortTabs;
