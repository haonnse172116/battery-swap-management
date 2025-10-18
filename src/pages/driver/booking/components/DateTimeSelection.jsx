const DateTimeSelection = ({ selectedTime, setSelectedTime, nextStep, prevStep }) => {
  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Select Booking Time</h2>
      <input
        type="datetime-local"
        value={selectedTime}
        onChange={(e) => setSelectedTime(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
      />

      {selectedTime && (
        <div className="flex justify-between mt-6">
          <button
            onClick={prevStep}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Back
          </button>
          <button
            onClick={nextStep}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default DateTimeSelection;
