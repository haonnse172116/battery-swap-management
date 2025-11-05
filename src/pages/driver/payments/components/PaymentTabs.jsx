import React from 'react';
import { 
  CreditCardIcon, 
  BoltIcon, 
  StarIcon 
} from '@heroicons/react/24/outline';

const PaymentTabs = ({ activeTab, setActiveTab, stats }) => {
  const tabs = [
    {
      key: 'all',
      label: 'Tất cả',
      icon: CreditCardIcon,
      count: stats.totalCount,
      color: 'blue'
    },
    {
      key: 'booking',
      label: 'Thay pin',
      icon: BoltIcon,
      count: stats.bookingCount,
      color: 'green'
    },
    {
      key: 'subscription',
      label: 'Gói dịch vụ',
      icon: StarIcon,
      count: stats.subscriptionCount,
      color: 'purple'
    }
  ];

  return (
    <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 transition-colors relative ${
                isActive
                  ? `bg-${tab.color}-50 text-${tab.color}-700 border-b-2 border-${tab.color}-500`
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  isActive 
                    ? `bg-${tab.color}-100 text-${tab.color}-700` 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentTabs;