import React, { useState, useMemo } from 'react';
import { 
  CreditCardIcon, 
  BanknotesIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import toast from '../../../utils/toast';
import { useGetMyPaymentsQuery } from '../../../services/payment.service';
import { useGetUserPaymentHistoryQuery } from '../../../services/subscriptionPayment.service';
import { useUser } from '../../../hooks/useUser';


import PaymentTabs from './components/PaymentTabs';
import PaymentFilters from './components/PaymentFilters';
import PaymentStats from './components/PaymentStats';
import BookingPaymentCard from './components/BookingPaymentCard';
import SubscriptionPaymentCard from './components/SubscriptionPaymentCard';

const PaymentsPage = () => {
  
  const [activeTab, setActiveTab] = useState('all'); 
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { userInfo: currentUser } = useUser();

  
  const { 
    data: bookingPaymentsResponse, 
    isLoading: isLoadingBooking, 
    error: bookingError,
    refetch: refetchBooking 
  } = useGetMyPaymentsQuery({
    page,
    pageSize,
    search: searchTerm,
    status: statusFilter === 'all' ? '' : statusFilter,
    sortBy
  });

  const { 
    data: subscriptionPaymentsResponse, 
    isLoading: isLoadingSub, 
    error: subError,
    refetch: refetchSub 
  } = useGetUserPaymentHistoryQuery({
    page,
    pageSize
  });

  
  const bookingPayments = bookingPaymentsResponse?.content || [];
  const subscriptionPayments = subscriptionPaymentsResponse?.content || [];

  
  const filteredPayments = useMemo(() => {
    let payments = [];
    
    switch (activeTab) {
      case 'booking':
        payments = bookingPayments.map(p => ({ ...p, type: 'booking' }));
        break;
      case 'subscription':
        payments = subscriptionPayments.map(p => ({ ...p, type: 'subscription' }));
        break;
      default: 
        payments = [
          ...bookingPayments.map(p => ({ ...p, type: 'booking' })),
          ...subscriptionPayments.map(p => ({ ...p, type: 'subscription' }))
        ];
    }

    
    if (statusFilter !== 'all') {
      payments = payments.filter(p => p.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    
    if (searchTerm) {
      payments = payments.filter(p => 
        p.orderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.payId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.subPayId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.bookingId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    
    payments.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      
      switch (sortBy) {
        case 'oldest':
          return dateA - dateB;
        case 'amount_high':
          return b.amount - a.amount;
        case 'amount_low':
          return a.amount - b.amount;
        default: 
          return dateB - dateA;
      }
    });

    return payments;
  }, [bookingPayments, subscriptionPayments, activeTab, statusFilter, searchTerm, sortBy]);

  
  const stats = useMemo(() => {
    const allPayments = [
      ...bookingPayments.map(p => ({ ...p, type: 'booking' })),
      ...subscriptionPayments.map(p => ({ ...p, type: 'subscription' }))
    ];

    const totalCount = allPayments.length;
    const bookingCount = bookingPayments.length;
    const subscriptionCount = subscriptionPayments.length;
    
    const paidPayments = allPayments.filter(p => {
      
      return p.amount > 1 || (p.amount === 1 && p.paymentMethod !== "Subscription_Plan");
    });
    
    const freePayments = allPayments.filter(p => {
      
      return (p.amount === 1 && p.paymentMethod === "Subscription_Plan") || p.amount === 0;
    });
    
    
    const totalAmount = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const hasFreeTransactions = freePayments.length > 0;
    
    const successCount = allPayments.filter(p => 
      p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'success'
    ).length;
    
    const pendingCount = allPayments.filter(p => 
      p.status?.toLowerCase() === 'pending'
    ).length;

    
    const subscriptionUsageCount = freePayments.filter(p => 
      p.amount === 1 && p.paymentMethod === "Subscription_Plan"
    ).length;

    
    const failedCount = allPayments.filter(p => 
      p.status?.toLowerCase() === 'failed'
    ).length;

    return {
      totalCount,
      bookingCount,
      subscriptionCount,
      totalAmount,
      hasFreeTransactions,
      freeCount: freePayments.length,
      subscriptionUsageCount, 
      successCount,
      pendingCount,
      failedCount,
      
      successRate: totalCount > 0 ? (successCount / totalCount) * 100 : 0
    };
  }, [bookingPayments, subscriptionPayments]);

  const isLoading = isLoadingBooking || isLoadingSub;
  const hasError = bookingError || subError;

  const handleRefresh = () => {
    toast.info('🔄 Đang làm mới dữ liệu...');
    refetchBooking();
    refetchSub();
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Lịch sử giao dịch
        </h1>
        <p className="text-gray-600">
          Quản lý và theo dõi tất cả giao dịch thanh toán của bạn
        </p>
      </div>

      {/* Statistics */}
      <PaymentStats stats={stats} isLoading={isLoading} />

      {/* Tabs */}
      <PaymentTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        stats={stats}
      />

      {/* Filters */}
      <PaymentFilters 
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        resultCount={filteredPayments.length}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Đang tải lịch sử giao dịch...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCardIcon className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Không thể tải dữ liệu
          </h3>
          <p className="text-sm text-red-600 mb-4">
            Có lỗi xảy ra khi tải lịch sử giao dịch
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !hasError && filteredPayments.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BanknotesIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Không có giao dịch nào
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Thử thay đổi bộ lọc để xem kết quả khác.'
              : 'Bạn chưa có giao dịch nào.'
            }
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setActiveTab('all');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {/* Payments List */}
      {!isLoading && !hasError && filteredPayments.length > 0 && (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            payment.type === 'booking' ? (
              <BookingPaymentCard 
                key={`booking-${payment.payId}`} 
                payment={payment} 
              />
            ) : (
              <SubscriptionPaymentCard 
                key={`subscription-${payment.subPayId}`} 
                payment={payment} 
              />
            )
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredPayments.length > 0 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
            >
              Trước
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Trang {page}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Tiếp
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;