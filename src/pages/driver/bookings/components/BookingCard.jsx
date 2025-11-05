import React from 'react';
import {
  MapPinIcon,
  ClockIcon,
  BoltIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import CountdownTimer from './CountdownTimer';
import { 
  getStatusConfig, 
  formatDateTime, 
  getTimeStatus,
  isUpcoming,
  isUrgent,
  isExpired,
  getEffectiveStatus,
  getDateForCountdown
} from '../../../../utils/booking'; // ✅ Import booking utils
import CarIcon from '../../../../constant/svg/Car';

const BookingCard = ({ booking, onUpdate }) => {
  const effectiveStatus = getEffectiveStatus(booking.timeSlot, booking.status);
  const statusConfig = getStatusConfig(effectiveStatus);
  const { date, time } = formatDateTime(booking.timeSlot);
  const timeStatus = getTimeStatus(booking.timeSlot);
  const countdownDate = getDateForCountdown(booking.timeSlot);

  const urgent = isUrgent(booking.timeSlot, booking.status);
  const upcoming = isUpcoming(booking.timeSlot, booking.status);
  const expired = isExpired(booking.timeSlot, booking.status);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'pending':
        return <ExclamationCircleIcon className="w-5 h-5" />;
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5" />;
      case 'expired':
        return <ClockIcon className="w-5 h-5" />;
      default:
        return <ExclamationCircleIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
      urgent ? 'ring-2 ring-red-300 border-red-200' : 
      upcoming ? 'border-blue-200' :
      statusConfig.borderColor
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b border-gray-100 ${
        urgent ? 'bg-red-50' : 
        upcoming ? 'bg-blue-50' : 
        statusConfig.bgColor
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            urgent ? 'bg-red-500 text-white' :
            upcoming ? 'bg-blue-500 text-white' :
            effectiveStatus === 'completed' ? 'bg-green-500 text-white' :
            effectiveStatus === 'expired' ? 'bg-gray-500 text-white' :
            'bg-yellow-500 text-white'
          }`}>
            {urgent ? '🚨' : 
             upcoming ? '📅' : 
             effectiveStatus === 'completed' ? '✅' :
             effectiveStatus === 'expired' ? '⏰' : '🔄'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Mã đặt lịch: {booking.bookingId}
            </h3>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {urgent && (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
              <span>🚨</span>
              <span>Khẩn cấp</span>
            </div>
          )}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
            <span className={statusConfig.iconColor}>
              {getStatusIcon(effectiveStatus)}
            </span>
            <span className="text-sm font-medium">
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Time & Location */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <ClockIcon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-gray-900 mb-1">Thời gian & Địa điểm</h4>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Ngày:</strong> {date}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Giờ:</strong> {time}
              </p>
              
              {/* Countdown for upcoming bookings */}
              {upcoming && (
                <div className="mt-2">
                  <CountdownTimer 
                    targetDate={countdownDate}
                    onExpire={() => onUpdate && onUpdate()}
                  />
                </div>
              )}
              
              {/* Time status */}
              {timeStatus && (
                <div className={`text-xs font-medium mt-2 ${
                  timeStatus.type === 'overdue' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {timeStatus.text}
                </div>
              )}
              
              <div className="flex items-center gap-1 mt-2">
                <MapPinIcon className="w-4 h-4 text-gray-500" />
                <p className="text-sm text-gray-600">
                  {booking.stationName || 'Chưa xác định trạm'}
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <CarIcon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-gray-900 mb-1">Phương tiện</h4>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Biển số:</strong> {booking.licensePlate || 'N/A'}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Hãng:</strong> {booking.vehicleBrand || 'N/A'}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Model:</strong> {booking.vehicleModel || 'N/A'}
              </p>
            </div>
          </div>

          {/* Battery & Notes */}
          <div className="md:col-span-2">
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <BoltIcon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-gray-900 mb-2">Thông tin bổ sung</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">
                      <strong>ID Trạm:</strong> {booking.stationId || 'N/A'}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <strong>ID Xe:</strong> {booking.vehicleId || 'N/A'}
                    </p>
                    <p className="text-gray-600">
                      <strong>Khách hàng:</strong> {booking.userName || booking.userEmail || 'N/A'}
                    </p>
                  </div>
                  <div>
                    {booking.note && (
                      <div>
                        <strong className="text-gray-700">Ghi chú:</strong>
                        <p className="text-gray-600 mt-1 italic">"{booking.note}"</p>
                      </div>
                    )}
                    {!booking.note && (
                      <p className="text-gray-500 italic">Không có ghi chú</p>
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

export default BookingCard;