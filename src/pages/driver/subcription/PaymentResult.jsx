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
import { PATHS } from '../../../constant/path/pathname';

const PaymentResult = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState(null);
  
  // Get payment info from localStorage or URL params
  const pendingPayment = JSON.parse(localStorage.getItem('pendingPayment') || 'null');
  const subPayId = searchParams.get('subPayId') || pendingPayment?.subPayId;
  
  // Query payment details
  const { 
    data: paymentResponse, 
    isLoading, 
    error,
    refetch 
  } = useGetSubscriptionPaymentQuery(subPayId, {
    skip: !subPayId,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (paymentResponse?.content) {
      setPaymentInfo(paymentResponse.content);
      // Clear pending payment from storage
      localStorage.removeItem('pendingPayment');
    }
  }, [paymentResponse]);

  // Auto-refresh for pending payments
  useEffect(() => {
    if (paymentInfo?.status === 'Pending') {
      const interval = setInterval(() => {
        refetch();
      }, 3000); // Check every 3 seconds

      return () => clearInterval(interval);
    }
  }, [paymentInfo?.status, refetch]);

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

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
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
          title: 'Thanh toán thất bại',
          message: 'Giao dịch không thể hoàn tất. Vui lòng thử lại',
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

  // Loading state
  if (isLoading || !paymentInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Đang tải thông tin thanh toán...
          </h3>
          <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !subPayId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Không tìm thấy thông tin thanh toán
          </h3>
          <p className="text-gray-600 mb-6">
            {error?.data?.message || 'Không thể tải thông tin giao dịch'}
          </p>
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

  const statusConfig = getStatusConfig(paymentInfo.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
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

            {paymentInfo.status === 'Pending' && (
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
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Mã giao dịch:</span>
                <span className="font-mono text-sm font-medium">{paymentInfo.subPayId}</span>
              </div>
              
              {paymentInfo.orderCode && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Mã đơn hàng:</span>
                  <span className="font-mono text-sm font-medium">{paymentInfo.orderCode}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Gói dịch vụ:</span>
                <span className="font-medium">{paymentInfo.planName}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Khách hàng:</span>
                <span className="font-medium">{paymentInfo.userName}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Số tiền:</span>
                <span className="font-semibold text-lg text-blue-600">
                  {formatPrice(paymentInfo.amount)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <CreditCardIcon className="w-4 h-4" />
                  Phương thức:
                </span>
                <span className="font-medium">
                  {paymentInfo.paymentMethod === 'Card' ? 'Thẻ ngân hàng' : paymentInfo.paymentMethod}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Trạng thái:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  paymentInfo.status === 'Success' || paymentInfo.status === 'Completed' 
                    ? 'bg-green-100 text-green-800'
                    : paymentInfo.status === 'Pending'
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {paymentInfo.status === 'Success' || paymentInfo.status === 'Completed' ? 'Thành công' :
                   paymentInfo.status === 'Pending' ? 'Đang xử lý' :
                   paymentInfo.status === 'Failed' ? 'Thất bại' : paymentInfo.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <CalendarDaysIcon className="w-4 h-4" />
                  Thời gian:
                </span>
                <span className="font-medium">{formatDate(paymentInfo.createdAt)}</span>
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
          
          {(paymentInfo.status === 'Success' || paymentInfo.status === 'Completed') && (
            <button
              onClick={() => navigate(PATHS.DRIVER.SUBSCRIPTION)}
              className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              Về trang gói dịch vụ
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          )}
          
          {paymentInfo.status === 'Failed' && (
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;