import { 
  CheckIcon, 
  ClockIcon, 
  ExclamationTriangleIcon, 
  CurrencyDollarIcon 
} from "@heroicons/react/24/outline";
import { useState, useEffect, useMemo } from "react";
import { 
  useCreateBookingMutation, 
  useGetEstimatedPriceMutation 
} from "../../../../services/booking.service";

const BUSINESS_START = 6;  
const BUSINESS_END = 22;

const toLocalISOString = (date) => {
  const tzOffsetMs = date.getTimezoneOffset() * 60000;
  const local = new Date(date.getTime() - tzOffsetMs);
  return local.toISOString().slice(0, -1);
};

const isWithinBusinessHours = (date = new Date()) => {
  const h = date.getHours();
  return h >= BUSINESS_START && h < BUSINESS_END;
};

const getNextAvailableTime = (date = new Date()) => {
  const currentHour = date.getHours();
  const currentMinute = date.getMinutes();

  if (!isWithinBusinessHours(date)) return "";

  const rawNext = currentMinute > 30 ? currentHour + 1 : currentHour + 1;
  const nextHour = Math.max(BUSINESS_START, rawNext);

  if (nextHour > BUSINESS_END) return "";

  return `${nextHour.toString().padStart(2, "0")}:00`;
};

const generateTimeOptions = (now = new Date()) => {
  
  if (!isWithinBusinessHours(now)) return [];

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  let startHour = currentMinute > 30 ? currentHour + 1 : currentHour + 1;

  if (startHour < BUSINESS_START) startHour = BUSINESS_START;

  const times = [];

  
  const LAST_HOUR_CAN_BOOK = BUSINESS_END - 1; 

  for (let hour = startHour; hour <= LAST_HOUR_CAN_BOOK; hour++) {
    const base = hour.toString().padStart(2, "0");

    
    times.push(`${base}:00`);

    
    
    if (hour < LAST_HOUR_CAN_BOOK) {
      
      times.push(`${base}:30`);
    }
  }

  return times;
};

const getExpiryTimeFromSelected = (selectedTime) => {
  if (!selectedTime) return "";
  const [h, m] = selectedTime.split(":");
  const expiryHour = (parseInt(h, 10) + 1) % 24;
  return `${expiryHour.toString().padStart(2, "0")}:${m}`;
};


const formatPrice = (price) => {
  if (!price || price === 0) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const Booking = ({
  selectedCar,
  selectedStation,
  selectedSlot,
  bookingData,
  setBookingData,
  prevStep,
}) => {
  
  const [selectedTime, setSelectedTime] = useState(() => getNextAvailableTime());
  const [estimatedPrice, setEstimatedPrice] = useState(null);

  const [
    createBooking,
    { isLoading: isCreatingBooking },
  ] = useCreateBookingMutation();

  const [
    getEstimatedPrice,
    { isLoading: isLoadingPrice, error: priceError },
  ] = useGetEstimatedPriceMutation();

  const bookingPossible = isWithinBusinessHours();

  
  const timeOptions = useMemo(() => generateTimeOptions(new Date()), []);

  
  useEffect(() => {
    const fetchEstimatedPrice = async () => {
      if (!selectedCar?.vehicleId || !selectedStation?.stationId) return;

      try {
        const res = await getEstimatedPrice({
          vehicleId: selectedCar.vehicleId,
          stationId: selectedStation.stationId,
        }).unwrap();

        const price =
          res?.estimatedPrice ??
          res?.content?.estimatedPrice ??
          res?.content ??
          res?.price ??
          0;

        setEstimatedPrice(price);
      } catch (err) {
        console.error("❌ Error fetching estimated price:", err);
        setEstimatedPrice(null);
      }
    };

    fetchEstimatedPrice();
  }, [
    selectedCar?.vehicleId,
    selectedStation?.stationId,
    getEstimatedPrice,
  ]);

  
  const handleBooking = async () => {
    if (!selectedTime) return;

    try {
      const today = new Date();
      const [hour, minute] = selectedTime.split(":");
      today.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);

      const bookingPayload = {
        vehicleId: selectedCar?.vehicleId,
        stationId: selectedStation?.stationId,
        slotIds: [selectedSlot?.stationSlotId],
        bookingDate: toLocalISOString(today),
      };

      const res = await createBooking(bookingPayload).unwrap();

      
      const success = res?.success ?? true;
      if (!success) {
        throw new Error(res?.message || "Booking creation failed");
      }

      setBookingData({
        status: "success",
        bookingId:
          res?.content?.bookingId || res?.content || "BK" + Date.now(),
        estimatedPrice,
        bookingDate: bookingPayload.bookingDate,
        selectedTime,
        slot: selectedSlot,
        station: selectedStation,
        car: selectedCar,
        createdAt: new Date().toISOString(),
        apiResponse: res,
      });
    } catch (error) {
      console.error("Booking creation error:", error);
      setBookingData({
        status: "error",
        error:
          error?.data?.message ||
          error?.message ||
          "Không thể tạo đặt chỗ",
        selectedTime,
        slot: selectedSlot,
        station: selectedStation,
        car: selectedCar,
      });
    }
  };

  const isBookingSuccessful = bookingData?.status === "success";
  const expiryTime = getExpiryTimeFromSelected(selectedTime);
  const expiryIsOutside =
    selectedTime &&
    (() => {
      const [h] = selectedTime.split(":");
      const exH = (parseInt(h, 10) + 1) % 24;
      return exH >= BUSINESS_END || exH < BUSINESS_START;
    })();

  return (
    <div>
      {/* === CHỌN THỜI GIAN === */}
      {!bookingData && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-blue-600" />
            Chọn thời gian đến trạm
          </h3>

          {/* ✅ Cảnh báo ngoài giờ */}
          {!bookingPossible && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <ClockIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">🚫 Không thể đặt chỗ hiện tại</p>
                  <p>
                    Hệ thống chỉ hoạt động trong giờ hành chính từ{" "}
                    <strong>6:00 sáng đến 22:00 tối</strong>.
                  </p>
                  <p className="mt-2">
                    <strong>Gợi ý:</strong> Hãy quay lại trong khung giờ hoạt động để
                    đặt chỗ.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ngày */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày (chỉ trong ngày)
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="font-semibold text-gray-800">
                  {new Date().toLocaleDateString("vi-VN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm text-gray-600">Hôm nay</p>
              </div>
            </div>

            {/* Giờ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-1">(6:00 - 22:00)</span>
              </label>

              {bookingPossible ? (
                <>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    disabled={isCreatingBooking || timeOptions.length === 0}
                  >
                    <option value="">-- Chọn giờ --</option>
                    {timeOptions.map((time) => {
                      const minute = time.split(":")[1];
                      const expiry = getExpiryTimeFromSelected(time);
                      const [h] = time.split(":");
                      const exH = (parseInt(h, 10) + 1) % 24;
                      const exOutside =
                        exH >= BUSINESS_END || exH < BUSINESS_START;
                      return (
                        <option key={time} value={time}>
                          {time} (hết hạn lúc{" "}
                          {exOutside
                            ? `${expiry} - ngoài giờ hành chính`
                            : expiry}
                          )
                        </option>
                      );
                    })}
                  </select>

                  {timeOptions.length === 0 && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Không còn khung giờ nào khả dụng trong giờ hành chính hôm nay
                      </p>
                    </div>
                  )}

                  {selectedTime && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ Chỗ sẽ được giữ đến {expiryTime}
                      {expiryIsOutside ? " (ngoài giờ hành chính)" : ""}
                    </p>
                  )}
                </>
              ) : (
                <div className="w-full p-3 border border-red-300 rounded-lg bg-red-50">
                  <div className="flex items-center gap-2 text-red-700">
                    <ClockIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Ngoài giờ hành chính</span>
                  </div>
                  <p className="text-xs text-red-600 mt-1">
                    Giờ hoạt động: 6:00 - 22:00 hàng ngày
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === THÔNG TIN XÁC NHẬN / CHI TIẾT === */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
          {bookingData ? "Chi tiết đặt chỗ" : "Xác nhận thông tin đặt chỗ"}
        </h2>

        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 space-y-3 sm:space-y-4">
          {/* Xe */}
          <div className="flex items-center justify-between border-b pb-3">
            <span className="font-medium text-gray-700 text-sm sm:text-base">Xe:</span>
            <div className="text-right">
              <div className="font-semibold text-sm sm:text-base">
                {selectedCar?.vBrand} {selectedCar?.model}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-mono">
                {selectedCar?.licensePlate}
              </div>
            </div>
          </div>

          {/* Trạm */}
          <div className="flex items-start justify-between border-b pb-3">
            <span className="font-medium text-gray-700 text-sm sm:text-base">
              Trạm:
            </span>
            <div className="text-right max-w-[60%]">
              <div className="font-semibold text-sm sm:text-base">
                {selectedStation?.stationName}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 truncate">
                {selectedStation?.address}
              </div>
            </div>
          </div>

          {/* Slot */}
          {selectedSlot && (
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-medium text-gray-700 text-sm sm:text-base">
                Slot:
              </span>
              <div className="text-right">
                <div className="font-semibold text-sm sm:text-base">
                  Slot {selectedSlot.slotNo}
                </div>
              </div>
            </div>
          )}

          {/* Thời gian */}
          <div className="flex items-center justify-between border-b pb-3">
            <span className="font-medium text-gray-700 text-sm sm:text-base">
              Thời gian:
            </span>
            <div className="text-right">
              <div className="font-semibold text-sm sm:text-base">
                Hôm nay, {selectedTime || "Chưa chọn"}
              </div>
              {selectedTime && (
                <div className="text-xs sm:text-sm text-amber-600">
                  Hết hạn: {expiryTime}
                </div>
              )}
              <div className="text-xs text-gray-500">
                {new Date().toLocaleDateString("vi-VN")}
              </div>
            </div>
          </div>

          {/* Loại pin */}
          <div className="flex items-center justify-between border-b pb-3">
            <span className="font-medium text-gray-700 text-sm sm:text-base">
              Loại pin:
            </span>
            <span className="font-semibold text-purple-700 text-sm sm:text-base">
              {selectedCar?.batteryTypeName}
            </span>
          </div>

          {!bookingData && bookingPossible && (
            <div className="flex items-center justify-between pt-3">
              <span className="font-medium text-gray-700 text-sm sm:text-base flex items-center gap-1">
                <CurrencyDollarIcon className="w-4 h-4" />
                Chi phí dự kiến:
              </span>
              <div className="text-right">
                {isLoadingPrice ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-sm text-gray-600">Đang tính...</span>
                  </div>
                ) : priceError ? (
                  <div className="text-sm text-red-600">⚠️ Không thể tính phí</div>
                ) : (
                  <span className="font-bold text-green-600 text-sm sm:text-base">
                    {formatPrice(estimatedPrice)}
                  </span>
                )}
                {!isLoadingPrice && !priceError && estimatedPrice !== null && (
                  <p className="text-xs text-gray-500 mt-1">
                    Phí cuối cùng có thể thay đổi
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Chi phí xác nhận (sau khi đặt) */}
          {bookingData?.estimatedPrice !== undefined && (
            <div className="flex items-center justify-between pt-3 bg-green-50 -mx-4 -mb-4 px-4 py-3 rounded-b-xl">
              <span className="font-medium text-green-700 text-sm sm:text-base flex items-center gap-1">
                <CurrencyDollarIcon className="w-4 h-4" />
                Chi phí xác nhận:
              </span>
              <span className="font-bold text-green-600 text-sm sm:text-base">
                {formatPrice(bookingData.estimatedPrice)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Lỗi tính giá */}
      {priceError && !bookingData && bookingPossible && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">⚠️ Không thể tính chi phí dự kiến</p>
              <p>
                Lỗi:{" "}
                {priceError?.data?.message ||
                  priceError?.message ||
                  "Không thể kết nối đến server"}
                . Bạn vẫn có thể tiếp tục đặt chỗ và chi phí sẽ được thông báo sau.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Đặt chỗ thất bại */}
      {bookingData?.status === "error" && (
        <div className="mb-6 p-4 sm:p-6 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-red-800 text-sm sm:text-base">
                Đặt chỗ thất bại!
              </h4>
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

      {/* Đặt chỗ thành công */}
      {bookingData?.status === "success" && (
        <div className="mb-6 p-4 sm:p-6 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex items-center justify-center">
              <CheckIcon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-green-800 text-sm sm:text-base">
                Yêu cầu đặt chỗ đã được gửi!
              </h4>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-green-700 space-y-1">
            <p>
              📋 Yêu cầu đặt <strong>Slot {bookingData.slot?.slotNo}</strong> tại{" "}
              <strong>{bookingData.station?.stationName}</strong> đã được gửi thành công.
            </p>
            <p>
              ⏰ Thời gian đặt: hôm nay lúc{" "}
              <strong>{bookingData.selectedTime}</strong>
            </p>
            {bookingData.estimatedPrice !== undefined && (
              <p>
                💰 Chi phí dự kiến:{" "}
                <strong>{formatPrice(bookingData.estimatedPrice)}</strong>
              </p>
            )}
            <p>
              ⏳ <strong>Đang chờ nhân viên trạm xác nhận...</strong>
            </p>
            <p>📱 Bạn sẽ nhận được thông báo qua email/SMS khi yêu cầu được duyệt hoặc từ chối.</p>
            <p>
              📋 Mã đặt chỗ: <strong>{bookingData.bookingId}</strong>
            </p>
          </div>
        </div>
      )}

      {/* === FOOTER BUTTONS === */}
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
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>Đã khóa (yêu cầu đã gửi)</span>
          </div>
        )}

        {!bookingData ? (
          <button
            onClick={handleBooking}
            disabled={isCreatingBooking || !selectedTime || !bookingPossible}
            className="order-1 sm:order-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base disabled:bg-gray-400"
          >
            {isCreatingBooking ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Đang gửi yêu cầu...</span>
              </>
            ) : !bookingPossible ? (
              <>
                <ClockIcon className="w-4 h-4" />
                <span>Ngoài giờ hành chính</span>
              </>
            ) : (
              <>
                <span>Gửi yêu cầu đặt chỗ</span>
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </>
            )}
          </button>
        ) : bookingData.status === "success" ? (
          <div className="order-1 sm:order-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => (window.location.href = "/driver/booking-page")}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <span>Xem yêu cầu của tôi</span>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => (window.location.href = "/driver/booking")}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <span>Tạo yêu cầu mới</span>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
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
