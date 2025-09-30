import { useState } from "react";

const DropdownMenu = ({ item, isActive, handleItemClick }) => {
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => {
    if (item.children) {
      setOpen((prev) => !prev);
    } else {
      handleItemClick(item);
    }
  };

  return (
    <div className="relative">
      {/* Nút cha */}
      <button
        onClick={toggleDropdown}
        className={`relative px-3 py-2 text-sm font-medium transition 
          ${
            isActive(item.key)
              ? "text-white"
              : "text-white/80 hover:text-white"
          }
          after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-300
          hover:after:w-full ${isActive(item.key) ? "after:w-full" : ""}`}
      >
        {item.label}
      </button>

      {/* Menu con xổ xuống bằng click */}
      {item.children && open && (
        <div
          className="absolute left-0 mt-2 min-w-[200px] bg-white border border-gray-200 
                     rounded-xl shadow-lg p-2 text-gray-700 z-50"
        >
          {item.children.map((child) => (
            <button
              key={child.key}
              onClick={() => handleItemClick(child)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${
                isActive(child.key)
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {child.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
