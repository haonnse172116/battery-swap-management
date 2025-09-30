import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "../../../constant/path/pathname";
import DropdownMenu from "../../common/DropdownMenu";

const staffMenuItems = [
  {
    key: PATHS.STAFF.SWAP.ROOT,
    label: "Swap Transaction",
    children: [
      { key: PATHS.STAFF.SWAP.PAYMENT, label: "Record Payment" },
      { key: PATHS.STAFF.SWAP.HISTORY, label: "Transaction History" },
      { key: PATHS.STAFF.SWAP.RETURN, label: "Returned Battery" },
      { key: PATHS.STAFF.SWAP.CONFIRM, label: "Confirm Swap" },
    ],
  },
  {
    key: PATHS.STAFF.INVENTORY.ROOT,
    label: "Battery Inventory",
    children: [
      { key: PATHS.STAFF.INVENTORY.CLASSIFY, label: "Classify Battery" },
      { key: PATHS.STAFF.INVENTORY.QUANTITY, label: "Track Quantity" },
    ],
  },
];

const StaffNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleItemClick = (item) => {
    if (item.key.startsWith("/")) {
      navigate(item.key);
      setMobileOpen(false);
    }
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          className="text-xl font-bold cursor-pointer"
          onClick={() => navigate(PATHS.STAFF.SWAP.ROOT)}
        >
          EV Staff
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-6">
          {staffMenuItems.map((item) => (
            <DropdownMenu
              key={item.key}
              item={item}
              isActive={isActive}
              handleItemClick={handleItemClick}
            />
          ))}
        </div>

        {/* Burger mobile */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center border border-white/40 rounded-md"
          onClick={() => setMobileOpen((v) => !v)}
        >
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/30 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
          <div className="px-4 py-3 space-y-1">
            {staffMenuItems.map((item) => (
              <div key={item.key}>
                <button
                  onClick={() => !item.children && handleItemClick(item)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    isActive(item.key)
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
                {item.children && (
                  <div className="pl-3 pt-1">
                    {item.children.map((child) => (
                      <button
                        key={child.key}
                        onClick={() => handleItemClick(child)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                          isActive(child.key)
                            ? "bg-white/20 text-white"
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default StaffNavbar;
