import { MapPinIcon } from "@heroicons/react/24/outline";

const StationSelection = ({
  selectedStation,
  setSelectedStation,
  nextStep,
  prevStep,
}) => {
  const stations = [
    { id: 1, name: "TS Station District 1", distance: "1.2 km" },
    { id: 2, name: "TS Station District 3", distance: "2.5 km" },
    { id: 3, name: "TS Station Binh Thanh", distance: "3.1 km" },
  ];

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Select Nearest Station</h2>
      <ul className="space-y-3">
        {stations.map((station) => (
          <li
            key={station.id}
            onClick={() => setSelectedStation(station)}
            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
              selectedStation?.id === station.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/40"
            }`}
          >
            <div className="flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-blue-500" />
              <p className="font-medium text-gray-800">{station.name}</p>
            </div>
            <span className="text-sm text-gray-500">
              {station.distance}
            </span>
          </li>
        ))}
      </ul>

      {selectedStation && (
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

export default StationSelection;
