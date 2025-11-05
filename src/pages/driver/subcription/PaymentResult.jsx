import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { useGetSubscriptionPaymentQuery } from '../../../services/subscriptionPayment.service';
import { useGetMySubscriptionQuery } from '../../../services/subcription.service';
import { useUser } from '../../../hooks/useUser'; // ✅ Use custom hook instead of Redux
import { PATHS } from '../../../constant/path/pathname';
import toast from '../../../utils/toast';

const PaymentResult = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState(null);
  
  // Get current user from custom hook
  const { userInfo: currentUser, isLoading: isLoadingUser } = useUser();
  
  // Extract PayOS parameters from URL
  const payosCode = searchParams.get('code');
  const payosId = searchParams.get('id');
  const payosCancel = searchParams.get('cancel') === 'true';
  const payosStatus = searchParams.get('status');
  const payosOrderCode = searchParams.get('orderCode');
  
  // Get payment info from localStorage 
  const pendingPayment = JSON.parse(localStorage.getItem('pendingPayment') || 'null');
  
  // ✅ Enhanced subPayId extraction with fallbacks
  const subPayId = pendingPayment?.subPayId || 
                   pendingPayment?.id || 
                   pendingPayment?.paymentId || 
                   pendingPayment?.transactionId ||
                   payosId; // Use PayOS ID as fallback

  // ✅ Debug localStorage and subPayId
  useEffect(() => {
    console.log('💾 LocalStorage Debug:');
    console.log('📦 Raw pendingPayment:', localStorage.getItem('pendingPayment'));
    console.log('📦 Parsed pendingPayment:', pendingPayment);
    console.log('📦 SubPayId extraction:', {
      fromSubPayId: pendingPayment?.subPayId,
      fromId: pendingPayment?.id,
      fromPaymentId: pendingPayment?.paymentId,
      fromTransactionId: pendingPayment?.transactionId,
      fromPayosId: payosId,
      final: subPayId
    });
    console.log('📦 Raw payment data:', pendingPayment?.rawPaymentData);
  }, [pendingPayment, subPayId, payosId]);
  
  // Determine payment status from PayOS params
  const getPaymentStatusFromUrl = () => {
    if (payosCancel) return 'Cancelled';
    if (payosCode === '00' && payosStatus === 'PAID') return 'Success';
    if (payosCode !== '00') return 'Failed';
    return 'Pending';
  };

  const urlPaymentStatus = getPaymentStatusFromUrl();
  
  // ✅ Query payment details with enhanced skip logic
  const { 
    data: paymentResponse, 
    isLoading: isLoadingPayment, 
    error: paymentError,
    refetch: refetchPayment 
  } = useGetSubscriptionPaymentQuery(subPayId, {
    skip: !subPayId || !currentUser,
    refetchOnMountOrArgChange: true,
  });

  // ✅ Debug API query
  useEffect(() => {
    console.log('🌐 Payment API Query Debug:', {
      subPayId,
      currentUser: !!currentUser,
      isSkipped: !subPayId || !currentUser,
      paymentResponse,
      isLoadingPayment,
      paymentError
    });
  }, [subPayId, currentUser, paymentResponse, isLoadingPayment, paymentError]);

  // Query updated subscription
  const { 
    refetch: refetchSubscription 
  } = useGetMySubscriptionQuery(undefined, {
    skip: !currentUser,
  });

  useEffect(() => {
    if (paymentResponse?.content) {
      console.log('📝 Setting payment info from API:', paymentResponse.content);
      setPaymentInfo(paymentResponse.content);
    }
  }, [paymentResponse]);

  // Handle payment success from URL
  useEffect(() => {
    if (urlPaymentStatus === 'Success' && payosOrderCode) {
      console.log('✅ Processing successful payment:', {
        urlPaymentStatus,
        payosOrderCode,
        payosCode,
        payosStatus,
        payosId
      });

      toast.success('Thanh toán thành công! Đang cập nhật thông tin gói dịch vụ...');

      setTimeout(() => {
        console.log('🔄 Refetching subscription data...');
        refetchSubscription();
      }, 2000);

      // Clear pending payment
      console.log('🗑️ Clearing pending payment from localStorage');
      localStorage.removeItem('pendingPayment');
    }
  }, [urlPaymentStatus, payosOrderCode, payosCode, payosStatus, payosId, refetchSubscription]);

  // Auto-refresh for pending payments
  useEffect(() => {
    if (paymentInfo?.status === 'Pending' && urlPaymentStatus === 'Pending') {
      console.log('⏰ Setting up auto-refresh for pending payment');
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing payment status...');
        refetchPayment();
      }, 3000);

      return () => {
        console.log('⏰ Clearing auto-refresh interval');
        clearInterval(interval);
      };
    }
  }, [paymentInfo?.status, urlPaymentStatus, refetchPayment]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Use URL status if available, fallback to API status
  const finalStatus = urlPaymentStatus !== 'Pending' ? urlPaymentStatus : paymentInfo?.status || 'Pending';
  
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
      case 'paid':
        return {
          icon: CheckCircleIconSolid,
          title: 'Thanh toán thành công!',
          message: 'Gói dịch vụ của bạn đã được kích hoạt',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-900'
        };
      case 'failed':
      case 'cancelled':
      case 'error':
        return {
          icon: XCircleIcon,
          title: payosCancel ? 'Thanh toán đã bị hủy' : 'Thanh toán thất bại',
          message: payosCancel ? 'Bạn đã hủy giao dịch' : 'Giao dịch không thể hoàn tất. Vui lòng thử lại',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-900'
        };
      case 'pending':
      default:
        return {
          icon: ClockIcon,
          title: 'Đang xử lý thanh toán',
          message: 'Vui lòng chờ trong giây lát...',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-900'
        };
    }
  };

  // ✅ Enhanced loading state check
  const isLoading = (isLoadingPayment && !paymentInfo && urlPaymentStatus === 'Pending') || 
                    isLoadingUser || 
                    (!subPayId && !payosOrderCode); // Still loading if no identifiers

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Đang tải thông tin thanh toán...
          </h3>
          <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
          {payosOrderCode && (
            <p className="text-xs text-gray-500 mt-2">
              Mã đơn hàng: {payosOrderCode}
            </p>
          )}
          
          {/* Debug info in loading state */}
          <div className="mt-4 p-3 bg-gray-100 rounded text-left text-xs">
            <p><strong>Debug:</strong></p>
            <p>SubPayId: {subPayId || 'null'}</p>
            <p>PayOS Order: {payosOrderCode || 'null'}</p>
            <p>URL Status: {urlPaymentStatus}</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Enhanced error handling
  if (!subPayId && !payosOrderCode && urlPaymentStatus === 'Pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Thiếu thông tin giao dịch
          </h3>
          <p className="text-gray-600 mb-6">
            Không tìm thấy thông tin giao dịch. Có thể do:
          </p>
          
          <div className="text-left text-sm text-gray-600 mb-6 space-y-1">
            <p>• Phiên thanh toán đã hết hạn</p>
            <p>• Dữ liệu localStorage bị xóa</p>
            <p>• URL không chứa thông tin cần thiết</p>
          </div>
          
          <div className="mb-4 p-3 bg-orange-100 rounded text-left text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>SubPayId: {subPayId || 'null'}</p>
            <p>PayOS Order: {payosOrderCode || 'null'}</p>
            <p>LocalStorage: {localStorage.getItem('pendingPayment') ? 'exists' : 'empty'}</p>
          </div>
          
          <button
            onClick={() => navigate(PATHS.DRIVER.SUBSCRIPTION)}
            className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Quay lại trang gói dịch vụ
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(finalStatus);
  const StatusIcon = statusConfig.icon;
  
  // ✅ Enhanced display data with better fallbacks
  const displayData = {
    planName: paymentInfo?.planName || 
              pendingPayment?.planName || 
              'Gói dịch vụ',
    amount: paymentInfo?.amount || 
            pendingPayment?.amount || 
            pendingPayment?.planPrice || 
            0,
    createdAt: paymentInfo?.createdAt || 
               pendingPayment?.timestamp || 
               new Date().toISOString(),
    userName: paymentInfo?.userName || 
              currentUser?.fullName || 
              currentUser?.email || 
              'N/A',
    orderCode: payosOrderCode || 
               paymentInfo?.orderCode || 
               pendingPayment?.orderCode || 
               'N/A'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Debug Panel - Remove in production */}
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">🔍 Debug Information</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p><strong>SubPayId:</strong> {subPayId || 'null'}</p>
            <p><strong>PayOS Order:</strong> {payosOrderCode || 'null'}</p>
            <p><strong>URL Status:</strong> {urlPaymentStatus}</p>
            <p><strong>Final Status:</strong> {finalStatus}</p>
            <p><strong>Payment Info:</strong> {paymentInfo ? 'Loaded from API' : 'Using localStorage'}</p>
            <p><strong>Has Pending Payment:</strong> {pendingPayment ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Main Result Card */}
        <div className={`bg-white rounded-2xl shadow-sm border-2 ${statusConfig.borderColor} ${statusConfig.bgColor} p-8 mb-6`}>
          <div className="text-center mb-8">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${statusConfig.bgColor} flex items-center justify-center`}>
              <StatusIcon className={`w-10 h-10 ${statusConfig.iconColor}`} />
            </div>
            
            <h1 className={`text-2xl font-bold mb-2 ${statusConfig.titleColor}`}>
              {statusConfig.title}
            </h1>
            
            <p className="text-gray-600 mb-6">
              {statusConfig.message}
            </p>

            {finalStatus === 'Pending' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 border border-yellow-200 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                <span className="text-sm text-yellow-800">Đang cập nhật trạng thái...</span>
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5" />
              Chi tiết giao dịch
            </h3>
            
            <div className="grid gap-4">
              {/* Enhanced order code display */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Mã đơn hàng:</span>
                <span className="font-mono text-sm font-medium">{displayData.orderCode}</span>
              </div>

              {/* Plan name */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Gói dịch vụ:</span>
                <span className="font-medium">{displayData.planName}</span>
              </div>
              
              {/* Amount */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Số tiền:</span>
                <span className="font-semibold text-lg text-blue-600">
                  {formatPrice(displayData.amount)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <CreditCardIcon className="w-4 h-4" />
                  Phương thức:
                </span>
                <span className="font-medium">
                  {paymentInfo?.paymentMethod === 'Card' ? 'Thẻ ngân hàng (PayOS)' : paymentInfo?.paymentMethod || 'Thẻ ngân hàng'}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Trạng thái:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  finalStatus === 'Success' 
                    ? 'bg-green-100 text-green-800'
                    : finalStatus === 'Pending'
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {finalStatus === 'Success' ? 'Thành công' :
                   finalStatus === 'Pending' ? 'Đang xử lý' :
                   finalStatus === 'Cancelled' ? 'Đã hủy' :
                   finalStatus === 'Failed' ? 'Thất bại' : finalStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate(PATHS.DRIVER.SUBSCRIPTION)}
            className="flex-1 py-3 px-6 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            Quay lại gói dịch vụ
          </button>
          
          {finalStatus === 'Success' && (
            <button
              onClick={() => navigate(PATHS.DRIVER.DASHBOARD)}
              className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              Về trang chủ
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          )}
          
          {(finalStatus === 'Failed' || finalStatus === 'Cancelled') && (
            <button
              onClick={() => navigate(PATHS.DRIVER.SUBSCRIPTION)}
              className="flex-1 py-3 px-6 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
            >
              Thử lại
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cần hỗ trợ?</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Nếu có vấn đề với giao dịch, vui lòng liên hệ hỗ trợ khách hàng</p>
            <p>• Gói dịch vụ sẽ được kích hoạt trong vòng 5-10 phút sau khi thanh toán thành công</p>
            <p>• Bạn có thể kiểm tra lại trạng thái gói dịch vụ trong trang Gói dịch vụ</p>
            {payosOrderCode && (
              <p>• Ghi chú mã đơn hàng <strong>{payosOrderCode}</strong> khi liên hệ hỗ trợ</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;