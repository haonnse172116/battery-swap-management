import React from 'react';
import {
  BoltIcon,
  ClockIcon,
  MapPinIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import CountdownTimer from './CountdownTimer';
import { formatDateTime, formatDate, getStatusConfig, isUpcoming, isUrgent } from '../../../../utils/booking';

const ICON_BY_TONE = {
  yellow: ExclamationCircleIcon,
  blue: CheckCircleIcon,
  green: CheckCircleIcon,
  red: XCircleIcon,
  gray: ExclamationCircleIcon,
};

const BookingCard = ({ booking }) => {
  const timeSlotFormatted = formatDateTime(booking.timeSlot);
  const upcoming = isUpcoming(booking.timeSlot, booking.status);
  const urgent = isUrgent(booking.timeSlot, booking.status);
  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = ICON_BY_TONE[statusConfig.tone];

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
        urgent ? 'border-red-200 ring-2 ring-red-100 shadow-red-100' : statusConfig.borderColor
      }`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b border-gray-100 ${
        urgent ? 'bg-red-50' : statusConfig.bgColor
      }`}>
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
              urgent
                ? 'bg-red-500 animate-pulse'
                : booking.status?.toLowerCase() === 'completed'
                ? 'bg-green-500'
                : booking.status?.toLowerCase() === 'confirmed'
                ? 'bg-blue-500'
                : booking.status?.toLowerCase() === 'cancelled'
                ? 'bg-red-500'
                : 'bg-yellow-500'
            }`}
          >
            {urgent
              ? '🚨'
              : booking.status?.toLowerCase() === 'completed'
              ? '✅'
              : booking.status?.toLowerCase() === 'confirmed'
              ? '🎫'
              : booking.status?.toLowerCase() === 'cancelled'
              ? '❌'
              : '⏳'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Mã đặt chỗ: {booking.bookingId}
            </h3>
            <p className="text-sm text-gray-600">
              Đặt ngày: {formatDate(booking.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {upcoming && <CountdownTimer targetDate={booking.timeSlot} />}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
            <StatusIcon className={`w-4 h-4 ${statusConfig.iconColor}`} />
            <span className="text-sm font-medium">{statusConfig.label}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vehicle */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <TruckIcon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-gray-900 mb-1">Xe</h4>
              <p className="text-sm text-gray-700 font-medium">
                {booking.vehicleBrand} {booking.vehicleModel}
              </p>
              <p className="text-sm text-gray-600 font-mono">{booking.licensePlate}</p>
              <p className="text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded mt-1 inline-block">
                🔋 {booking.batteryTypeName}
              </p>
            </div>
          </div>

          {/* Station */}
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPinIcon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-gray-900 mb-1">Trạm thay pin</h4>
              <p className="text-sm text-gray-700 font-medium">{booking.stationName}</p>
              <p className="text-xs text-gray-600">{booking.stationAddress}</p>
            </div>
          </div>

          {/* Time */}
          <div className={`flex items-start gap-3 p-3 rounded-lg ${urgent ? 'bg-red-50' : 'bg-purple-50'}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              urgent ? 'bg-red-500' : 'bg-purple-500'
            }`}>
              <ClockIcon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-gray-900 mb-1">
                Thời gian đặt {urgent && <span className="text-red-500 ml-1">🚨</span>}
              </h4>
              <p className="text-sm text-gray-700 font-medium">{timeSlotFormatted.date}</p>
              <p className="text-sm text-gray-600">Lúc {timeSlotFormatted.time}</p>

              {upcoming && (
                <div className="mt-2">
                  <CountdownTimer targetDate={booking.timeSlot} />
                </div>
              )}
              {urgent && (
                <p className="text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded mt-1 inline-block animate-pulse">
                  🚨 Sắp đến giờ! Chuẩn bị khởi hành!
                </p>
              )}
              {upcoming && !urgent && (
                <p className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded mt-1 inline-block">
                  ⏰ Nhớ đến đúng giờ nhé!
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <BoltIcon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-gray-900 mb-1">Trạng thái</h4>
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                <StatusIcon className={`w-3 h-3 ${statusConfig.iconColor}`} />
                {statusConfig.label}
              </div>

              {booking.confirmedByName && (
                <p className="text-xs text-gray-600 mt-1">👤 Xác nhận bởi: {booking.confirmedByName}</p>
              )}
              {booking.completedAt && (
                <p className="text-xs text-gray-600 mt-1">✅ Hoàn thành: {formatDate(booking.completedAt)}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
