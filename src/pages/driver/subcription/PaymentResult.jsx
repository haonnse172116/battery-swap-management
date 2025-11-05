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
  
  // ✅ Debug logging component mount
  useEffect(() => {
    console.log('🔍 PaymentResult Component Mounted');
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 Current pathname:', window.location.pathname);
    console.log('🔍 Search params object:', Object.fromEntries(searchParams.entries()));
  }, []);
  
  // Get current user from custom hook
  const { userInfo: currentUser, isLoading: isLoadingUser } = useUser();
  
  // ✅ Debug user info
  useEffect(() => {
    console.log('👤 User Info:', {
      currentUser,
      isLoadingUser,
      userId: currentUser?.userId
    });
  }, [currentUser, isLoadingUser]);
  
  // Extract PayOS parameters from URL
  const payosCode = searchParams.get('code');
  const payosId = searchParams.get('id');
  const payosCancel = searchParams.get('cancel') === 'true';
  const payosStatus = searchParams.get('status');
  const payosOrderCode = searchParams.get('orderCode');
  
  // ✅ Debug PayOS parameters
  useEffect(() => {
    console.log('💳 PayOS Parameters:', {
      payosCode,
      payosId,
      payosCancel,
      payosStatus,
      payosOrderCode
    });
  }, [payosCode, payosId, payosCancel, payosStatus, payosOrderCode]);
  
  // Get payment info from localStorage 
  const pendingPayment = JSON.parse(localStorage.getItem('pendingPayment') || 'null');
  const subPayId = pendingPayment?.subPayId;
  
  // ✅ Debug localStorage data
  useEffect(() => {
    console.log('💾 LocalStorage Data:');
    console.log('📦 Raw pendingPayment string:', localStorage.getItem('pendingPayment'));
    console.log('📦 Parsed pendingPayment:', pendingPayment);
    console.log('📦 Extracted subPayId:', subPayId);
    
    // Check all localStorage keys
    console.log('📦 All localStorage keys:', Object.keys(localStorage));
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      console.log(`📦 ${key}:`, value);
    }
  }, [pendingPayment, subPayId]);
  
  // Determine payment status from PayOS params
  const getPaymentStatusFromUrl = () => {
    if (payosCancel) return 'Cancelled';
    if (payosCode === '00' && payosStatus === 'PAID') return 'Success';
    if (payosCode !== '00') return 'Failed';
    return 'Pending';
  };

  const urlPaymentStatus = getPaymentStatusFromUrl();
  
  // ✅ Debug payment status
  useEffect(() => {
    console.log('📊 Payment Status Analysis:', {
      urlPaymentStatus,
      payosCode,
      payosStatus,
      payosCancel,
      logic: {
        isCancel: payosCancel,
        isSuccess: payosCode === '00' && payosStatus === 'PAID',
        isFailed: payosCode !== '00' && !payosCancel
      }
    });
  }, [urlPaymentStatus, payosCode, payosStatus, payosCancel]);
  
  // Query payment details
  const { 
    data: paymentResponse, 
    isLoading: isLoadingPayment, 
    error: paymentError,
    refetch: refetchPayment 
  } = useGetSubscriptionPaymentQuery(subPayId, {
    skip: !subPayId,
    refetchOnMountOrArgChange: true,
  });

  // ✅ Debug API response
  useEffect(() => {
    console.log('🌐 Payment API Response:', {
      paymentResponse,
      isLoadingPayment,
      paymentError,
      subPayId,
      isSkipped: !subPayId
    });
    
    if (paymentResponse) {
      console.log('🌐 Payment Response Content:', paymentResponse.content);
      console.log('🌐 Payment Response Success:', paymentResponse.success);
      console.log('🌐 Payment Response Message:', paymentResponse.message);
    }
    
    if (paymentError) {
      console.error('🌐 Payment API Error:', paymentError);
    }
  }, [paymentResponse, isLoadingPayment, paymentError, subPayId]);

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

  // ✅ Debug final payment info state
  useEffect(() => {
    console.log('📝 Final Payment Info State:', paymentInfo);
  }, [paymentInfo]);

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

      // Show success message immediately
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
  
  // ✅ Debug final status
  useEffect(() => {
    console.log('🎯 Final Status Calculation:', {
      urlPaymentStatus,
      paymentInfoStatus: paymentInfo?.status,
      finalStatus,
      logic: `${urlPaymentStatus} !== 'Pending' ? ${urlPaymentStatus} : ${paymentInfo?.status || 'Pending'}`
    });
  }, [urlPaymentStatus, paymentInfo?.status, finalStatus]);

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

  // Loading state
  if ((isLoadingPayment && !paymentInfo && urlPaymentStatus === 'Pending') || isLoadingUser) {
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
          
          {/* ✅ Debug info in loading state */}
          <div className="mt-4 p-3 bg-gray-100 rounded text-left text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>isLoadingPayment: {isLoadingPayment.toString()}</p>
            <p>isLoadingUser: {isLoadingUser.toString()}</p>
            <p>paymentInfo: {paymentInfo ? 'exists' : 'null'}</p>
            <p>urlPaymentStatus: {urlPaymentStatus}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (paymentError && !paymentInfo && !payosOrderCode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Không tìm thấy thông tin thanh toán
          </h3>
          <p className="text-gray-600 mb-6">
            {paymentError?.data?.message || 'Không thể tải thông tin giao dịch'}
          </p>
          
          {/* ✅ Debug info in error state */}
          <div className="mb-4 p-3 bg-red-100 rounded text-left text-xs">
            <p><strong>Debug Error Info:</strong></p>
            <p>Error: {JSON.stringify(paymentError, null, 2)}</p>
            <p>subPayId: {subPayId || 'null'}</p>
            <p>payosOrderCode: {payosOrderCode || 'null'}</p>
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
  
  // ✅ Debug data sources for display
  const displayData = {
    planName: paymentInfo?.planName || pendingPayment?.planName || 'N/A',
    amount: paymentInfo?.amount || pendingPayment?.amount || 0,
    createdAt: paymentInfo?.createdAt || pendingPayment?.timestamp || null,
    userName: paymentInfo?.userName || currentUser?.fullName || currentUser?.email || 'N/A'
  };
  
  useEffect(() => {
    console.log('🎨 Display Data Sources:', {
      displayData,
      sources: {
        planName: {
          paymentInfo: paymentInfo?.planName,
          pendingPayment: pendingPayment?.planName,
          final: displayData.planName
        },
        amount: {
          paymentInfo: paymentInfo?.amount,
          pendingPayment: pendingPayment?.amount,
          final: displayData.amount
        },
        createdAt: {
          paymentInfo: paymentInfo?.createdAt,
          pendingPayment: pendingPayment?.timestamp,
          final: displayData.createdAt
        }
      }
    });
  }, [paymentInfo, pendingPayment, currentUser, displayData]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* ✅ Debug Panel - Remove this in production */}
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">🔍 Debug Information</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p><strong>URL Status:</strong> {urlPaymentStatus}</p>
            <p><strong>PayOS Code:</strong> {payosCode || 'None'}</p>
            <p><strong>PayOS Status:</strong> {payosStatus || 'None'}</p>
            <p><strong>Order Code:</strong> {payosOrderCode || 'None'}</p>
            <p><strong>SubPayId:</strong> {subPayId || 'None'}</p>
            <p><strong>Payment Info:</strong> {paymentInfo ? 'Loaded' : 'Not loaded'}</p>
            <p><strong>Pending Payment:</strong> {pendingPayment ? 'Exists' : 'Not found'}</p>
            <p><strong>User:</strong> {currentUser?.email || 'Not loaded'}</p>
            <p><strong>Final Status:</strong> {finalStatus}</p>
          </div>
          
          <details className="mt-2">
            <summary className="cursor-pointer text-yellow-800 font-medium">Raw Data</summary>
            <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded overflow-auto">
              {JSON.stringify({
                paymentInfo,
                pendingPayment,
                currentUser,
                payosParams: { payosCode, payosId, payosCancel, payosStatus, payosOrderCode }
              }, null, 2)}
            </pre>
          </details>
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
              {/* PayOS Information */}
              {payosOrderCode && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Mã đơn hàng PayOS:</span>
                  <span className="font-mono text-sm font-medium">{payosOrderCode}</span>
                </div>
              )}

              {payosId && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">ID giao dịch PayOS:</span>
                  <span className="font-mono text-sm font-medium">{payosId}</span>
                </div>
              )}

              {/* Internal payment info */}
              {paymentInfo?.subPayId && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Mã giao dịch nội bộ:</span>
                  <span className="font-mono text-sm font-medium">{paymentInfo.subPayId}</span>
                </div>
              )}
              
              {/* Plan info with debug */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Gói dịch vụ:</span>
                <span className="font-medium">
                  {displayData.planName}
                  <span className="text-xs text-gray-400 ml-2">
                    (API: {paymentInfo?.planName || 'null'} | LS: {pendingPayment?.planName || 'null'})
                  </span>
                </span>
              </div>
              
              {currentUser && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Khách hàng:</span>
                  <span className="font-medium">
                    {displayData.userName}
                  </span>
                </div>
              )}
              
              {/* Amount with debug */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Số tiền:</span>
                <span className="font-semibold text-lg text-blue-600">
                  {formatPrice(displayData.amount)}
                  <span className="text-xs text-gray-400 block">
                    (API: {paymentInfo?.amount || 'null'} | LS: {pendingPayment?.amount || 'null'})
                  </span>
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
              
              {/* Date with debug */}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <CalendarDaysIcon className="w-4 h-4" />
                  Thời gian:
                </span>
                <span className="font-medium">
                  {displayData.createdAt ? formatDate(displayData.createdAt) : 'N/A'}
                  <span className="text-xs text-gray-400 block">
                    (API: {paymentInfo?.createdAt || 'null'} | LS: {pendingPayment?.timestamp || 'null'})
                  </span>
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