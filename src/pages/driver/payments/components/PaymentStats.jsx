import React from 'react';
import { 
  BanknotesIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ChartBarIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';

const PaymentStats = ({ stats, isLoading }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0); // ✅ Add fallback
  };

  const statItems = [
    {
      label: 'Tổng giao dịch',
      value: stats?.totalCount || 0, 
      icon: ChartBarIcon,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-500'
    },
    {
      label: 'Tổng tiền thanh toán',
      value: (stats?.hasFreeTransactions && stats?.subscriptionUsageCount > 0) ? (
        <div className="text-right">
          <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
        </div>
      ) : (
        <div className="text-2xl font-bold">{formatCurrency(stats?.totalAmount)}</div>
      ),
      icon: BanknotesIcon,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      iconBg: 'bg-green-500'
    },
    {
      label: 'Thành công',
      value: stats?.successCount || 0,
      icon: CheckCircleIcon,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      iconBg: 'bg-emerald-500'
    },
    {
      label: 'Dùng gói dịch vụ',
      value: stats?.subscriptionUsageCount || 0,
      icon: SparklesIcon,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      iconBg: 'bg-purple-500'
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
          <div key={item.label} className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${item.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 mb-1 truncate">{item.label}</p>
                <div className={`${item.textColor}`}>
                  {/* ✅ Handle different value types */}
                  {typeof item.value === 'object' ? (
                    item.value
                  ) : (
                    <p className="text-2xl font-bold">
                      {item.value}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* ✅ Add progress indicator for subscription usage */}
            {item.label === 'Dùng gói dịch vụ' && (stats?.subscriptionUsageCount || 0) > 0 && (
              <div className="mt-3 pt-3 border-t border-purple-100">
                <div className="flex justify-between items-center text-xs text-purple-600">
                  <span>Đã sử dụng</span>
                  <span>{stats.subscriptionUsageCount} lần</span>
                </div>
                <div className="w-full bg-purple-100 rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, ((stats?.subscriptionUsageCount || 0) / Math.max((stats?.subscriptionUsageCount || 0), 10)) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* ✅ Add percentage for success rate */}
            {item.label === 'Thành công' && (stats?.totalCount || 0) > 0 && (
              <div className="mt-2 text-xs text-emerald-600">
                {(((stats?.successCount || 0) / (stats?.totalCount || 1)) * 100).toFixed(1)}% tỷ lệ thành công
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PaymentStats;