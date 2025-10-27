import { CheckIcon } from "@heroicons/react/24/outline";
import { useState } from 'react';

const Booking = ({ 
  selectedCar,           
  selectedStation,       
  selectedSlot,         
  selectedDateTime,   
  bookingData,          
  setBookingData,       
  prevStep 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBooking = async () => { 
    setIsProcessing(true);
    
    
    const generateBookingDate = () => {
      
      if (selectedDateTime?.isoString) {
        return selectedDateTime.isoString;
      }
      
      
      if (selectedDateTime?.date && selectedDateTime?.time) {
        try {
          
          const dateStr = selectedDateTime.date; 
          const timeStr = selectedDateTime.time; 
          
          
          const dateTimeStr = `${dateStr}T${timeStr}:00.000Z`;
          const testDate = new Date(dateTimeStr);
          
          
          if (isNaN(testDate.getTime())) {
            throw new Error('Invalid date/time combination');
          }
          
          return dateTimeStr;
        } catch (error) {
          console.warn('Error parsing selectedDateTime, using current time:', error);
          return new Date().toISOString();
        }
      }
      
      
      const fallbackDate = new Date();
      fallbackDate.setHours(fallbackDate.getHours() + 1);
      return fallbackDate.toISOString();
    };

    
    const bookingPayload = {
      vehicleId: selectedCar?.vehicleId || selectedCar?.carId,
      stationId: selectedStation?.stationId,
      slotIds: [selectedSlot?.stationSlotId],
      bookingDate: generateBookingDate()
    };

    console.log("Creating booking with payload:", bookingPayload);

    
    setTimeout(() => {
      setBookingData({
        status: 'success',
        bookingId: 'BK' + Date.now(),
        bookingDate: bookingPayload.bookingDate,
        slot: selectedSlot,
        station: selectedStation,
        car: selectedCar,
        createdAt: new Date().toISOString()
      });
      setIsProcessing(false);
    }, 2000);
  };

  console.log("Booking received full booking data:", { 
    selectedCar, 
    selectedStation,
    selectedSlot, 
    selectedDateTime
  });

  return (
    <div>
      {/* ✅ Complete Booking Summary - Responsive */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Xác nhận đặt chỗ</h2> {/* ✅ Updated title */}
        
        {/* Booking Details */}
        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <span className="font-medium text-gray-700 text-sm sm:text-base">Xe:</span>
            <div className="text-right">
              <div className="font-semibold text-sm sm:text-base">{selectedCar?.vBrand} {selectedCar?.model}</div>
              <div className="text-xs sm:text-sm text-gray-600 font-mono">{selectedCar?.licensePlate}</div>
              {selectedCar?.vehicleId && (
                <div className="text-xs text-gray-500 font-mono">ID: {selectedCar.vehicleId}</div>
              )}
            </div>
          </div>
          
          <div className="flex items-start justify-between border-b pb-3">
            <span className="font-medium text-gray-700 text-sm sm:text-base">Trạm:</span>
            <div className="text-right max-w-[60%]">
              <div className="font-semibold text-sm sm:text-base">{selectedStation?.stationName}</div>
              <div className="text-xs sm:text-sm text-gray-600 truncate">{selectedStation?.address}</div>
              {selectedStation?.stationId && (
                <div className="text-xs text-gray-500 font-mono">ID: {selectedStation.stationId}</div>
              )}
            </div>
          </div>
          
          {/* ✅ Add Selected Slot Information */}
          {selectedSlot && (
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-medium text-gray-700 text-sm sm:text-base">Slot:</span>
              <div className="text-right">
                <div className="font-semibold text-sm sm:text-base">Slot {selectedSlot.slotNo}</div>
                {selectedSlot.batteryLevel && (
                  <div className="text-xs sm:text-sm text-gray-600">
                    🔋 Pin {selectedSlot.batteryLevel}%
                  </div>
                )}
                {selectedSlot.batteryId && (
                  <div className="text-xs text-gray-500 font-mono">
                    Pin: {selectedSlot.batteryId}
                  </div>
                )}
                <div className="text-xs text-gray-500 font-mono">
                  ID: {selectedSlot.stationSlotId}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between border-b pb-3">
            <span className="font-medium text-gray-700 text-sm sm:text-base">Thời gian:</span>
            <div className="text-right">
              <div className="font-semibold text-sm sm:text-base">{selectedDateTime?.date}</div>
              <div className="text-xs sm:text-sm text-gray-600">{selectedDateTime?.time}</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3">
            <span className="font-medium text-gray-700 text-sm sm:text-base">Loại pin:</span>
            <span className="font-semibold text-purple-700 text-sm sm:text-base">{selectedCar?.batteryTypeName}</span>
          </div>


        </div>
      </div>


      {/* ✅ Booking Success */}
      {bookingData && (
        <div className="mb-6 p-4 sm:p-6 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex items-center justify-center">
              <CheckIcon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-green-800 text-sm sm:text-base">Đặt chỗ thành công!</h4> {/* ✅ Updated message */}
              <p className="text-xs sm:text-sm text-green-600">
                Mã đặt chỗ: {bookingData.bookingId} {/* ✅ Updated field name */}
              </p>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-green-700 space-y-1">
            <p>🎯 <strong>Slot {bookingData.slot?.slotNo}</strong> tại <strong>{bookingData.station?.stationName}</strong> đã được đặt chỗ.</p>
            <p>📧 Bạn sẽ nhận được thông báo qua email và SMS.</p>
            <p>⏰ Vui lòng đến trạm đúng giờ đã hẹn: <strong>{selectedDateTime?.date}</strong> lúc <strong>{selectedDateTime?.time}</strong></p>
            <p>🔋 Pin sẽ sẵn sàng với mức <strong>{bookingData.slot?.batteryLevel}%</strong> khi bạn đến.</p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-blue-600 italic">🛠️ Development: Booking được tạo với mock data</p>
            )}
          </div>
        </div>
      )}

      {/* ✅ Booking API Data Preview (Development Only) */}
      {/* {process.env.NODE_ENV === 'development' && !bookingData && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">🔍 API Payload Preview:</h4>
          <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
{JSON.stringify({
  vehicleId: selectedCar?.vehicleId || selectedCar?.carId,
  stationId: selectedStation?.stationId,
  slotIds: [selectedSlot?.stationSlotId],
  bookingDate: selectedDateTime?.isoString || new Date(selectedDateTime?.date + 'T' + selectedDateTime?.time).toISOString()
}, null, 2)}
          </pre>
        </div>
      )} */}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <button
          onClick={prevStep}
          disabled={isProcessing}
          className="order-2 sm:order-1 px-4 sm:px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50 text-sm sm:text-base"
        >
          ← Quay lại
        </button>
        
        {!bookingData ? (
          <button
            onClick={handleBooking} 
            disabled={isProcessing}
            className="order-1 sm:order-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Đang tạo đặt chỗ...</span> {/* ✅ Updated processing text */}
              </>
            ) : (
              <>
                <span>Xác nhận đặt chỗ</span> {/* ✅ Updated button text */}
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => window.location.href = '/driver/bookings'}
            className="order-1 sm:order-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <span>Xem đặt chỗ của tôi</span> 
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Booking; 