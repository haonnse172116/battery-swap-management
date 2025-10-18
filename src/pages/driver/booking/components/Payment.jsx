import { CheckIcon } from "@heroicons/react/24/outline";

const Payment = ({
  selectedCar,
  selectedStation,
  selectedTime,
  paymentDone,
  setPaymentDone,
  prevStep,
}) => {
  return (
    <div>
      <h2 className="text-lg font-medium mb-4">
        Confirm & Proceed to Payment
      </h2>

      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-4">
        <p><strong>Car:</strong> {selectedCar?.name}</p>
        <p><strong>License:</strong> {selectedCar?.license}</p>
        <p><strong>Station:</strong> {selectedStation?.name}</p>
        <p><strong>Time:</strong> {new Date(selectedTime).toLocaleString()}</p>
      </div>

      {!paymentDone ? (
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Back
          </button>
          <button
            onClick={() => setPaymentDone(true)}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Pay Now
          </button>
        </div>
      ) : (
        <div className="text-center mt-8">
          <CheckIcon className="w-10 h-10 text-green-500 mx-auto" />
          <p className="text-lg font-semibold mt-2 text-green-700">
            Booking Confirmed!
          </p>
        </div>
      )}
    </div>
  );
};

export default Payment;
