import { CheckIcon, ClockIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useState } from 'react';
import { useCreateBookingMutation } from '../../../../services/booking.service';

const Booking = ({ 
  selectedCar,           
  selectedStation,       
  selectedSlot,         
  bookingData,          
  setBookingData,       
  prevStep 
}) => {
  const [selectedTime, setSelectedTime] = useState(() => {
    const now = new Date();
    const roundedHour = now.getHours() + 1;
    return `${roundedHour.toString().padStart(2, '0')}:00`;
  });

  const [createBooking, { 
    isLoading: isCreatingBooking, 
    isError: isBookingError,
    error: bookingError 
  }] = useCreateBookingMutation();

  const generateTimeOptions = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const times = [];
    
    let startHour = currentMinute > 30 ? currentHour + 2 : currentHour + 1;
    
    for (let hour = startHour; hour <= 23; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
      times.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    return times;
  };

  const timeOptions = generateTimeOptions();

  const handleBooking = async () => {
    try {
      const today = new Date();
      const [hour, minute] = selectedTime.split(':');
      today.setHours(parseInt(hour), parseInt(minute), 0, 0);

       const toLocalISOString = (date) => {
      const tzOffsetMs = date.getTimezoneOffset() * 60000; 
      const localTime = new Date(date.getTime() - tzOffsetMs);
      return localTime.toISOString().slice(0, -1); 
    };
      const bookingPayload = {
        vehicleId: selectedCar?.vehicleId,
        stationId: selectedStation?.stationId, 
        slotIds: [selectedSlot?.stationSlotId],
        bookingDate: toLocalISOString(today)
      };

      const response = await createBooking(bookingPayload).unwrap();
      

      if (response.success) {
        setBookingData({
          status: 'success',
          bookingId: response.content || response.message || 'BK' + Date.now(),
          bookingDate: bookingPayload.bookingDate,
          selectedTime: selectedTime,
          slot: selectedSlot,
          station: selectedStation,
          car: selectedCar,
          createdAt: new Date().toISOString(),
          apiResponse: response
        });
      } else {
        throw new Error(response.message || 'Booking creation failed');
      }

    } catch (error) {
      console.error("Booking creation error:", error);
      
      setBookingData({
        status: 'error',
        error: error?.data?.message || error?.message || 'Không thể tạo đặt chỗ',
        selectedTime: selectedTime,
        slot: selectedSlot,
        station: selectedStation,
        car: selectedCar
      });
    }
  };

  const getExpiryTime = () => {
    if (!selectedTime) return '';
    
    const [hour, minute] = selectedTime.split(':');
    const expiryHour = (parseInt(hour) + 1) % 24;
    return `${expiryHour.toString().padStart(2, '0')}:${minute}`;
  };

   const isBookingSuccessful = bookingData?.status === 'success';

  return (
    <div>
      {!bookingData && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-blue-600" />
            Chọn thời gian đến trạm
          </h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">⏰ Lưu ý quan trọng:</p>
                <p>Hệ thống sẽ chỉ giữ chỗ trong vòng <strong>1 tiếng</strong> sau giờ đặt. Vui lòng đến đúng giờ để tránh mất chỗ.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày (chỉ trong ngày)
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="font-semibold text-gray-800">
                  {new Date().toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-600">Hôm nay</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                disabled={isCreatingBooking}
              >
                <option value="">-- Chọn giờ --</option>
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time} (hết hạn lúc {(() => {
                      const [hour, minute] = time.split(':');
                      const expiryHour = (parseInt(hour) + 1) % 24;
                      return `${expiryHour.toString().padStart(2, '0')}:${minute}`;
                    })()})
                  </option>
                ))}
              </select>
              {selectedTime && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Chỗ sẽ được giữ đến {getExpiryTime()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
          {bookingData ? 'Chi tiết đặt chỗ' : 'Xác nhận thông tin đặt chỗ'}
        </h2>
        
        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <span className="font-medium text-gray-700 text-sm sm:text-base">Xe:</span>
            <div className="text-right">
              <div className="font-semibold text-sm sm:text-base">{selectedCar?.vBrand} {selectedCar?.model}</div>
              <div className="text-xs sm:text-sm text-gray-600 font-mono">{selectedCar?.licensePlate}</div>
            </div>
          </div>
          
          <div className="flex items-start justify-between border-b pb-3">
            <span className="font-medium text-gray-700 text-sm sm:text-base">Trạm:</span>
            <div className="text-right max-w-[60%]">
              <div className="font-semibold text-sm sm:text-base">{selectedStation?.stationName}</div>
              <div className="text-xs sm:text-sm text-gray-600 truncate">{selectedStation?.address}</div>
            </div>
          </div>
          
          {selectedSlot && (
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-medium text-gray-700 text-sm sm:text-base">Slot:</span>
              <div className="text-right">
                <div className="font-semibold text-sm sm:text-base">Slot {selectedSlot.slotNo}</div>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between border-b pb-3">
            <span className="font-medium text-gray-700 text-sm sm:text-base">Thời gian:</span>
            <div className="text-right">
              <div className="font-semibold text-sm sm:text-base">
                Hôm nay, {selectedTime || 'Chưa chọn'}
              </div>
              {selectedTime && (
                <div className="text-xs sm:text-sm text-amber-600">
                  Hết hạn: {getExpiryTime()}
                </div>
              )}
              <div className="text-xs text-gray-500">
                {new Date().toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3">
            <span className="font-medium text-gray-700 text-sm sm:text-base">Loại pin:</span>
            <span className="font-semibold text-purple-700 text-sm sm:text-base">{selectedCar?.batteryTypeName}</span>
          </div>
        </div>
      </div>

      {/* ✅ API Error Display */}
      {bookingData?.status === 'error' && (
        <div className="mb-6 p-4 sm:p-6 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-red-800 text-sm sm:text-base">Đặt chỗ thất bại!</h4>
              <p className="text-xs sm:text-sm text-red-600">
                {bookingData.error}
              </p>
            </div>
          </div>
          <button
            onClick={() => setBookingData(null)}
            className="text-sm text-red-600 hover:text-red-800 underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ✅ Booking Success */}
      {bookingData?.status === 'success' && (
        <div className="mb-6 p-4 sm:p-6 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex items-center justify-center">
              <CheckIcon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-green-800 text-sm sm:text-base">Đặt chỗ thành công!</h4>
              <p className="text-xs sm:text-sm text-green-600">
                Mã đặt chỗ: {bookingData.bookingId}
              </p>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-green-700 space-y-1">
            <p>🎯 <strong>Slot {bookingData.slot?.slotNo}</strong> tại <strong>{bookingData.station?.stationName}</strong> đã được đặt chỗ.</p>
            <p>⏰ Vui lòng đến trạm hôm nay lúc <strong>{bookingData.selectedTime}</strong></p>
            <p>⚠️ <strong>Chỗ sẽ được giữ đến {(() => {
              const [hour, minute] = bookingData.selectedTime.split(':');
              const expiryHour = (parseInt(hour) + 1) % 24;
              return `${expiryHour.toString().padStart(2, '0')}:${minute}`;
            })()}</strong> - vui lòng đến đúng giờ!</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between gap-3">
        {!isBookingSuccessful ? (
          <button
            onClick={prevStep}
            disabled={isCreatingBooking}
            className="order-2 sm:order-1 px-4 sm:px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50 text-sm sm:text-base"
          >
            ← Quay lại
          </button>
        ) : (
          <div className="order-2 sm:order-1 px-4 sm:px-6 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed text-sm sm:text-base flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Đã khóa (đặt chỗ thành công)</span>
          </div>
        )}
        
        {!bookingData ? (
          <button
            onClick={handleBooking} 
            disabled={isCreatingBooking || !selectedTime}
            className="order-1 sm:order-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base disabled:bg-gray-400"
          >
            {isCreatingBooking ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Đang tạo đặt chỗ...</span>
              </>
            ) : (
              <>
                <span>Xác nhận đặt chỗ</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        ) : bookingData.status === 'success' ? (
          <div className="order-1 sm:order-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => window.location.href = '/driver/booking-page'}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <span>Xem đặt chỗ của tôi</span> 
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => window.location.href = '/driver/booking'}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <span>Đặt chỗ mới</span>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setBookingData(null)}
            className="order-1 sm:order-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <span>Thử lại</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Booking;