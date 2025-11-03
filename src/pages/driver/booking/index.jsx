import React, { useState } from "react";
import {
  CheckIcon,
  ChevronRightIcon,
  TruckIcon,
  BoltIcon,
  ClockIcon,
  CalendarIcon, 
} from "@heroicons/react/24/outline";
import CarSelection from "./components/CarSelection";
import StationSelection from "./components/StationSelection";
import SlotSelection from "./components/SlotSelection";
import Booking from "./components/Booking"; 
import CarIcon from "../../../constant/svg/Car";

const BookingPage = () => { 
  const [step, setStep] = useState(1);
  
  
  const [selectedCar, setSelectedCar] = useState(null);           
  const [selectedStation, setSelectedStation] = useState(null);   
  const [selectedSlot, setSelectedSlot] = useState(null);         
  
  // ✅ Remove selectedDateTime from main component - will be handled in Booking
  const [bookingData, setBookingData] = useState(null);          

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  
  const isStepCompleted = (stepNumber) => {
    switch (stepNumber) {
      case 1: return selectedCar !== null;
      case 2: return selectedStation !== null;
      case 3: return selectedSlot !== null;
      case 4: return bookingData !== null; 
      default: return false;
    }
  };

  
  const stepConfig = [
    { 
      label: "Chọn xe", 
      icon: CarIcon,
      data: selectedCar ? {
        main: `${selectedCar.vBrand} ${selectedCar.model}`,
        sub: selectedCar.licensePlate
      } : null,
      color: "blue"
    },
    { 
      label: "Chọn trạm", 
      icon: BoltIcon,
      data: selectedStation ? {
        main: selectedStation.stationName,
        sub: selectedStation.address?.split(',')[0] || 'Địa chỉ'
      } : null,
      color: "green"
    },
    { 
      label: "Chọn slot", 
      icon: ClockIcon,
      data: selectedSlot ? {
        main: `Slot ${selectedSlot.slotNo}`, 
        sub: selectedSlot.batteryLevel ? `Pin ${selectedSlot.batteryLevel}%` : 'Slot đã chọn' 
      } : null,
      color: "purple"
    },
    { 
      label: "Đặt chỗ", 
      icon: CalendarIcon, 
      data: bookingData ? { 
        main: "Hoàn tất",
        sub: `Mã: ${bookingData.bookingId?.slice(-6) || 'N/A'}` 
      } : null,
      color: "amber"
    }
  ];

  return (
    <div className="px-10 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Đặt chỗ thay pin
      </h1>
      <p className="text-gray-600 mb-8">
        Thực hiện theo các bước để hoàn tất đặt chỗ của bạn
      </p>

      {/* ✅ Beautiful Step Indicator */}
      <div className="relative mb-12">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-10">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out"
            style={{ 
              width: `${((step - 1) / 3) * 100}%` 
            }}
          />
        </div>

        {/* Steps */}
        <div className="flex justify-between">
          {stepConfig.map((stepItem, i) => {
            const stepNumber = i + 1;
            const isActive = step === stepNumber;
            const isCompleted = isStepCompleted(stepNumber);
            const isPast = step > stepNumber;
            const IconComponent = stepItem.icon;

            return (
              <div key={i} className="flex flex-col items-center group">
                {/* Step Circle with Icon */}
                <div className="relative">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center 
                      border-3 transition-all duration-300 shadow-lg group-hover:scale-105
                      ${isCompleted 
                        ? `bg-green-500 border-green-500 text-white shadow-green-200` 
                        : isActive
                        ? `bg-white border-${stepItem.color}-500 text-${stepItem.color}-600 shadow-${stepItem.color}-200 ring-4 ring-${stepItem.color}-100`
                        : isPast
                        ? `bg-${stepItem.color}-500 border-${stepItem.color}-500 text-white shadow-${stepItem.color}-200`
                        : "bg-white border-gray-300 text-gray-400 shadow-gray-100"
                      }
                    `}
                  >
                    {isCompleted ? (
                      <CheckIcon className="w-6 h-6" />
                    ) : (
                      <IconComponent className="w-6 h-6" />
                    )}
                  </div>

                  {/* Active Pulse Animation */}
                  {isActive && (
                    <div className={`absolute inset-0 rounded-full bg-${stepItem.color}-400 animate-ping opacity-25`} />
                  )}
                </div>
                
                {/* Step Content */}
                <div className="text-center mt-3 max-w-32">
                  {/* Step Label */}
                  <div className={`
                    font-semibold text-sm mb-1 transition-colors
                    ${isActive 
                      ? `text-${stepItem.color}-700` 
                      : isCompleted || isPast
                      ? 'text-gray-700'
                      : 'text-gray-500'
                    }
                  `}>
                    {stepItem.label}
                  </div>
                  
                  {/* Selected Data */}
                  {stepItem.data ? (
                    <div className={`
                      p-2 rounded-lg border transition-all duration-200
                      ${isActive 
                        ? `bg-${stepItem.color}-50 border-${stepItem.color}-200` 
                        : 'bg-gray-50 border-gray-200'
                      }
                    `}>
                      <div className="font-medium text-xs text-gray-800 truncate">
                        {stepItem.data.main}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {stepItem.data.sub}
                      </div>
                    </div>
                  ) : (
                    <div className="h-12 flex items-center justify-center">
                      <span className="text-xs text-gray-400">
                        Chưa chọn
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ✅ Step Content with Beautiful Cards */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        {/* Step Header */}
        <div className={`
          px-8 py-6 border-b border-gray-100
          bg-gradient-to-r from-${stepConfig[step-1].color}-50 to-${stepConfig[step-1].color}-100
        `}>
          <div className="flex items-center gap-4">
            <div className={`
              w-10 h-10 rounded-xl bg-${stepConfig[step-1].color}-500 
              flex items-center justify-center text-white shadow-lg
            `}>
              {React.createElement(stepConfig[step-1].icon, { className: "w-5 h-5" })}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Bước {step}: {stepConfig[step-1].label}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {step === 1 && "Chọn xe của bạn để bắt đầu"}
                {step === 2 && "Tìm trạm thay pin phù hợp"}
                {step === 3 && "Chọn vị trí slot vật lý"}
                {step === 4 && "Chọn thời gian và xác nhận đặt chỗ"} {/* ✅ Updated description */}
              </p>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-8">
          {step === 1 && (
            <CarSelection
              selectedCar={selectedCar}
              setSelectedCar={setSelectedCar}
              nextStep={nextStep}
            />
          )}

          {step === 2 && (
            <StationSelection
              selectedCar={selectedCar}        
              selectedStation={selectedStation}
              setSelectedStation={setSelectedStation}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}

          {step === 3 && (
            <SlotSelection
              selectedCar={selectedCar}           
              selectedStation={selectedStation}     
              selectedSlot={selectedSlot}
              setSelectedSlot={setSelectedSlot}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}

          {step === 4 && (
            <Booking 
              selectedCar={selectedCar}             
              selectedStation={selectedStation}     
              selectedSlot={selectedSlot}
              bookingData={bookingData} 
              setBookingData={setBookingData} 
              prevStep={prevStep}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
