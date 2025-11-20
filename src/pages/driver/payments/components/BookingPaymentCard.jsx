import React from 'react';
import { 
  BoltIcon, 
  CreditCardIcon, 
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const BookingPaymentCard = ({ payment }) => {
  const isFreePayment = (payment) => {
    return (payment.amount === 1 && payment.paymentMethod === "Subscription_Plan") ||
           payment.amount === 0;
  };

  const formatCurrency = (amount, paymentMethod) => {
    if ((amount === 1 && paymentMethod === "Subscription_Plan") || amount === 0) {
      return "Miễn phí";
    }
    
    if (!amount) return "0 ₫";
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return {
          label: 'Thành công',
          icon: CheckCircleIcon,
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600'
        };
      case 'pending':
        return {
          label: 'Đang xử lý',
          icon: ClockIcon,
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600'
        };
      case 'failed':
        return {
          label: 'Thất bại',
          icon: XCircleIcon,
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600'
        };
      case 'cancelled':
        return {
          label: 'Đã hủy',
          icon: XCircleIcon,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600'
        };
      default:
        return {
          label: status || 'Không xác định',
          icon: ExclamationTriangleIcon,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600'
        };
    }
  };

  const getPaymentMethodIcon = (method, amount) => {
    if (amount === 1 && method === "Subscription_Plan") {
      return '🎁'; 
    }
    
    switch (method?.toLowerCase()) {
      case 'cash':
        return '💵';
      case 'card':
        return '💳';
      case 'bank':
        return '🏦';
      case 'ewallet':
        return '📱';
      case 'subscription_plan':
        return '📋'; 
      default:
        return '💳';
    }
  };

  const getPaymentMethodName = (method, amount) => {
    if (amount === 1 && method === "Subscription_Plan") {
      return "Sử dụng gói dịch vụ";
    }
    
    switch (method?.toLowerCase()) {
      case 'cash':
        return 'Tiền mặt';
      case 'card':
        return 'Thẻ tín dụng/ghi nợ';
      case 'bank':
        return 'Chuyển khoản ngân hàng';
      case 'ewallet':
        return 'Ví điện tử';
      case 'subscription_plan':
        return 'Gói dịch vụ';
      default:
        return method || 'N/A';
    }
  };

  const statusConfig = getStatusConfig(payment.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${statusConfig.borderColor}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b border-gray-100 ${statusConfig.bgColor}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
            isFreePayment(payment) ? 'bg-purple-500' : 'bg-green-500'
          }`}>
            <BoltIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {isFreePayment(payment) ? 'Thay pin (Gói dịch vụ)' : 'Thanh toán thay pin'}
            </h3>
            <p className="text-sm text-gray-600">
              Mã giao dịch: {payment.payId}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* ✅ Show free badge for subscription payments */}
          {isFreePayment(payment) && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
              🎁 Miễn phí
            </span>
          )}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
            <StatusIcon className={`w-4 h-4 ${statusConfig.iconColor}`} />
            <span className="text-sm font-medium">
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Payment Info */}
          <div className={`flex items-start gap-3 p-3 rounded-lg ${
            isFreePayment(payment) ? 'bg-purple-50' : 'bg-blue-50'
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isFreePayment(payment) ? 'bg-purple-500' : 'bg-blue-500'
            }`}>
              <CreditCardIcon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-gray-900 mb-1">Thông tin thanh toán</h4>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Số tiền:</strong> 
                <span className={`ml-1 font-bold ${
                  isFreePayment(payment)
                    ? 'text-purple-600'
                    : statusConfig.label === 'Thành công' 
                    ? 'text-green-600' 
                    : 'text-gray-700'
                }`}>
                  {formatCurrency(payment.amount, payment.paymentMethod)}
                </span>
              </p>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Tiền tệ:</strong> {payment.currency || 'VND'}
              </p>
              {/* ✅ Show subscription info for free payments */}
              {isFreePayment(payment) && (
                <p className="text-sm text-purple-700 mb-1">
                  <strong>Loại:</strong> Sử dụng gói dịch vụ đã đăng ký
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg">{getPaymentMethodIcon(payment.paymentMethod, payment.amount)}</span>
                <span className="text-sm text-gray-600">
                  {getPaymentMethodName(payment.paymentMethod, payment.amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Booking Info */}
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <DocumentTextIcon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-gray-900 mb-1">Thông tin đặt lịch</h4>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Mã đặt lịch:</strong> {payment.bookingId || 'N/A'}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Mã đơn hàng:</strong> {payment.orderCode || 'N/A'}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Khách hàng:</strong> {payment.userName || 'N/A'}
              </p>
              {/* ✅ Show additional info for subscription payments */}
              {isFreePayment(payment) && (
                <p className="text-sm text-purple-700 mt-1">
                  <strong>✨ Sử dụng gói dịch vụ đã đăng ký</strong>
                </p>
              )}
            </div>
          </div>

          {/* Time Info */}
          <div className="md:col-span-2">
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-gray-900 mb-2">Thông tin giao dịch</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">
                      <strong>Tạo lúc:</strong>
                    </p>
                    <p className="text-gray-800 font-mono">
                      {formatDateTime(payment.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">
                      <strong>Phương thức:</strong>
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getPaymentMethodIcon(payment.paymentMethod, payment.amount)}</span>
                      <span className="text-gray-800">
                        {getPaymentMethodName(payment.paymentMethod, payment.amount)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600">
                      <strong>Trạng thái:</strong>
                    </p>
                    <p className={`font-medium ${statusConfig.textColor}`}>
                      {statusConfig.label}
                    </p>
                    {/* ✅ Show payment URL if available and not subscription */}
                    {payment.paymentUrl && 
                     payment.paymentUrl.trim() !== "" && 
                     !isFreePayment(payment) && (
                      <a 
                        href={payment.paymentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
                      >
                        Xem chi tiết thanh toán
                      </a>
                    )}
                    {/* ✅ Show user ID for subscription payments */}
                    {isFreePayment(payment) && payment.userId && (
                      <p className="text-gray-500 text-xs mt-1 font-mono">
                        User: {payment.userId.slice(0, 8)}...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPaymentCard;