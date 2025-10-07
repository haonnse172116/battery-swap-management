import { useState } from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const MyCar = () => {
  const [cars, setCars] = useState([
    {
      id: 1,
      name: "VinFast VF e34",
      license: "51H-123.45",
      image: "/vf8.png",
    },
    {
      id: 2,
      name: "Toyota Corolla Cross",
      license: "30G-678.90",
      image: "/vf8.png",
    },
  ]);

  // --- Modal state ---
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [form, setForm] = useState({ name: "", license: "", image: "" });

  // --- Handlers ---
  const handleOpenAdd = () => {
    setEditingCar(null);
    setForm({ name: "", license: "", image: "" });
    setShowModal(true);
  };

  const handleOpenEdit = (car) => {
    setEditingCar(car);
    setForm({
      name: car.name,
      license: car.license,
      image: car.image,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingCar) {
      // update
      setCars((prev) =>
        prev.map((c) =>
          c.id === editingCar.id ? { ...c, ...form } : c
        )
      );
    } else {
      // add new
      const newCar = {
        id: Date.now(),
        ...form,
      };
      setCars((prev) => [...prev, newCar]);
    }
    setShowModal(false);
  };

  const handleRemove = (id) => setCars(cars.filter((car) => car.id !== id));

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">My Cars</h1>
        <button
          onClick={handleOpenAdd}
className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200"
        >
          <PlusIcon className="w-5 h-5" />
          Add New Car
        </button>
      </div>

      {/* List */}
      <ul className="divide-y divide-gray-200">
        {cars.map((car) => (
          <li
            key={car.id}
            className="flex items-center justify-between py-4 px-3 rounded-xl cursor-pointer border border-transparent hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
            onClick={() => console.log("Clicked car", car)}
          >
            <div className="flex items-center gap-4">
              <img
                src={car.image}
                alt={car.name}
                className="w-28 h-20 object-cover rounded-xl border border-gray-200 shadow-sm"
              />
              <div>
                <p className="font-semibold text-gray-900">{car.name}</p>
                <p className="text-sm text-gray-500">{car.license}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleOpenEdit(car)}
                className="text-blue-600 hover:text-blue-800"
              >
                <PencilSquareIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleRemove(car.id)}
                className="text-red-600 hover:text-red-800"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {cars.length === 0 && (
        <p className="text-gray-500 text-center mt-8">
          You haven’t added any cars yet.
        </p>
      )}

      {/* --- Modal --- */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold mb-4">
              {editingCar ? "Edit Car" : "Add New Car"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Car Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Enter car name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Plate
                </label>
                <input
                  type="text"
                  value={form.license}
                  onChange={(e) => setForm({ ...form, license: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Ex: 51H-123.45"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="/vf8.png"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCar;
