const CarSelection = ({ selectedCar, setSelectedCar, nextStep }) => {
  const cars = [
    { id: 1, name: "VinFast VF e34", license: "51H-123.45", battery: "75%", image: "/vf8.png" },
    { id: 2, name: "Toyota Corolla Cross", license: "30G-678.90", battery: "60%", image: "/vf8.png" },
  ];

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Select Your Car</h2>
      <ul className="space-y-3">
        {cars.map((car) => (
          <li
            key={car.id}
            onClick={() => setSelectedCar(car)}
            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition ${
              selectedCar?.id === car.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/40"
            }`}
          >
            <img
              src={car.image}
              alt={car.name}
              className="w-20 h-16 rounded-lg object-cover"
            />
            <div>
              <p className="font-semibold text-gray-800">{car.name}</p>
              <p className="text-sm text-gray-500">{car.license}</p>
              <p className="text-sm text-gray-500">🔋 Battery: {car.battery}</p>
            </div>
          </li>
        ))}
      </ul>

      {selectedCar && (
        <div className="flex justify-end mt-6">
          <button
            onClick={nextStep}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default CarSelection;
