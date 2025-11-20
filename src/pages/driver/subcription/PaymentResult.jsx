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
import { useUser } from '../../../hooks/useUser';
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
  
  // Get the real subPayId from localStorage (NOT PayOS ID)
  const realSubPayId = pendingPayment?.subPayId;
  const payosTransactionId = payosId;
  
  // Determine payment status from PayOS params
  const getPaymentStatusFromUrl = () => {
    if (payosCancel) return 'Cancelled';
    if (payosCode === '00' && payosStatus === 'PAID') return 'Success';
    if (payosCode !== '00') return 'Failed';
    return 'Pending';
  };

  const urlPaymentStatus = getPaymentStatusFromUrl();
  
  // Query payment details using real subPayId
  const { 
    data: paymentResponse, 
    isLoading: isLoadingPayment, 
    error: paymentError,
    refetch: refetchPayment 
  } = useGetSubscriptionPaymentQuery(realSubPayId, {
    skip: !realSubPayId || !currentUser,
    refetchOnMountOrArgChange: true,
  });

  // Query updated subscription
  const { 
    refetch: refetchSubscription 
  } = useGetMySubscriptionQuery(undefined, {
    skip: !currentUser,
  });

  useEffect(() => {
    if (paymentResponse?.content) {
      setPaymentInfo(paymentResponse.content);
    }
  }, [paymentResponse]);

  // Handle payment success - wait for user to load first
  useEffect(() => {
    if (urlPaymentStatus === 'Success' && payosOrderCode && currentUser) {
      toast.success('Thanh toán thành công! Đang cập nhật thông tin gói dịch vụ...');

      // Refetch subscription after delay
      setTimeout(() => {
        refetchSubscription();
      }, 2000);

      // Clear pending payment after processing
      setTimeout(() => {
        localStorage.removeItem('pendingPayment');
      }, 5000);
    }
  }, [urlPaymentStatus, payosOrderCode, currentUser, refetchSubscription]);

  // Auto-refresh for pending payments (only if we have real data)
  useEffect(() => {
    if (realSubPayId && paymentInfo?.status === 'Pending' && urlPaymentStatus === 'Pending') {
      const interval = setInterval(() => {
        refetchPayment();
      }, 3000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [realSubPayId, paymentInfo?.status, urlPaymentStatus, refetchPayment]);

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

  // Loading logic
  const isLoading = isLoadingUser || 
                    (urlPaymentStatus === 'Pending' && !realSubPayId && !payosOrderCode);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Đang tải thông tin...
          </h3>
          <p className="text-gray-600">
            {isLoadingUser ? 'Đang xác thực người dùng...' : 'Đang tải thông tin thanh toán...'}
          </p>
        </div>
      </div>
    );
  }

  // If success from URL, show success even without API data
  if (urlPaymentStatus === 'Success' && payosOrderCode) {
    const statusConfig = getStatusConfig('Success');
    const StatusIcon = statusConfig.icon;
    
    const displayData = {
      planName: paymentInfo?.planName || pendingPayment?.planName || 'Gói dịch vụ',
      amount: paymentInfo?.amount || pendingPayment?.amount || pendingPayment?.planPrice || 0,
      createdAt: paymentInfo?.createdAt || pendingPayment?.timestamp || new Date().toISOString(),
      userName: paymentInfo?.userName || currentUser?.fullName || currentUser?.email || 'N/A',
      orderCode: payosOrderCode
    };

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
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
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                Chi tiết giao dịch
              </h3>
              
              <div className="grid gap-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Mã đơn hàng PayOS:</span>
                  <span className="font-mono text-sm font-medium">{payosOrderCode}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">PayOS Transaction ID:</span>
                  <span className="font-mono text-sm font-medium">{payosTransactionId}</span>
                </div>

                {realSubPayId && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Mã giao dịch nội bộ:</span>
                    <span className="font-mono text-sm font-medium">{realSubPayId}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Gói dịch vụ:</span>
                  <span className="font-medium">{displayData.planName}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Khách hàng:</span>
                  <span className="font-medium">{displayData.userName}</span>
                </div>
                
                {/* <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Số tiền:</span>
                  <span className="font-semibold text-lg text-blue-600">
                    {formatPrice(displayData.amount)}
                  </span>
                </div>
                 */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Phương thức:</span>
                  <span className="font-medium">Thẻ ngân hàng (PayOS)</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Trạng thái:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Thanh toán thành công
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <CalendarDaysIcon className="w-4 h-4" />
                    Thời gian:
                  </span>
                  <span className="font-medium">
                    {formatDate(displayData.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate(PATHS.DRIVER.SUBSCRIPTION)}
              className="flex-1 py-3 px-6 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Quay lại gói dịch vụ
            </button>
            
            <button
              onClick={() => navigate(PATHS.DRIVER.DASHBOARD)}
              className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              Về trang chủ
              <ArrowRightIcon className="w-5 h-5" />
            </button>
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
  }

  // Handle other cases (failed, cancelled, pending)
  const statusConfig = getStatusConfig(finalStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className={`bg-white rounded-2xl shadow-sm border-2 ${statusConfig.borderColor} ${statusConfig.bgColor} p-8 text-center`}>
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${statusConfig.bgColor} flex items-center justify-center`}>
            <StatusIcon className={`w-10 h-10 ${statusConfig.iconColor}`} />
          </div>
          
          <h1 className={`text-2xl font-bold mb-2 ${statusConfig.titleColor}`}>
            {statusConfig.title}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {statusConfig.message}
          </p>

          {payosOrderCode && (
            <p className="text-sm text-gray-500 mb-6">
              Mã đơn hàng: <span className="font-mono">{payosOrderCode}</span>
            </p>
          )}

          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate(PATHS.DRIVER.SUBSCRIPTION)}
              className="py-3 px-6 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Quay lại gói dịch vụ
            </button>
            
            {finalStatus === 'Failed' && (
              <button
                onClick={() => navigate(PATHS.DRIVER.SUBSCRIPTION)}
                className="py-3 px-6 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                Thử lại thanh toán
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;