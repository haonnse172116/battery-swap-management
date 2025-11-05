import React from 'react';
import { 
  BanknotesIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

const PaymentStats = ({ stats, isLoading }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const statItems = [
    {
      label: 'Tổng giao dịch',
      value: stats.totalCount,
      icon: ChartBarIcon,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-500'
    },
    {
      label: 'Tổng tiền',
      value: formatCurrency(stats.totalAmount),
      icon: BanknotesIcon,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      iconBg: 'bg-green-500'
    },
    {
      label: 'Thành công',
      value: stats.successCount,
      icon: CheckCircleIcon,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      iconBg: 'bg-emerald-500'
    },
    {
      label: 'Đang xử lý',
      value: stats.pendingCount,
      icon: ClockIcon,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      iconBg: 'bg-yellow-500'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className={`${item.bgColor} border border-gray-200 rounded-xl p-6`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${item.iconBg} rounded-lg flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">{item.label}</p>
                <p className={`text-2xl font-bold ${item.textColor}`}>
                  {item.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PaymentStats;