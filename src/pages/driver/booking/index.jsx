import { useState } from "react";
import {
  CheckIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import CarSelection from "./components/CarSelection";
import StationSelection from "./components/StationSelection";
import DateTimeSelection from "./components/DateTimeSelection";
import Payment from "./components/Payment";

const Booking = () => {
  const [step, setStep] = useState(1);
  const [selectedCar, setSelectedCar] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [paymentDone, setPaymentDone] = useState(false);

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="px-10 py-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Book a Battery Swap
      </h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {["Select Car", "Station", "Time", "Payment"].map((label, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step > i + 1
                  ? "bg-blue-600 text-white"
                  : step === i + 1
                  ? "bg-blue-100 text-blue-700 border border-blue-400"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step > i + 1 ? <CheckIcon className="w-5 h-5" /> : i + 1}
            </div>
            {i < 3 && (
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            )}
          </div>
        ))}
      </div>

      {/* Step rendering */}
      {step === 1 && (
        <CarSelection
          selectedCar={selectedCar}
          setSelectedCar={setSelectedCar}
          nextStep={nextStep}
        />
      )}

      {step === 2 && (
        <StationSelection
          selectedStation={selectedStation}
          setSelectedStation={setSelectedStation}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}

      {step === 3 && (
        <DateTimeSelection
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}

      {step === 4 && (
        <Payment
          selectedCar={selectedCar}
          selectedStation={selectedStation}
          selectedTime={selectedTime}
          paymentDone={paymentDone}
          setPaymentDone={setPaymentDone}
          prevStep={prevStep}
        />
      )}
    </div>
  );
};

export default Booking;
