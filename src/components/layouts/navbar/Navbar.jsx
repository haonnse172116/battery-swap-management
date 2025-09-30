import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "../../../constant/path/pathname";
import DropdownMenu from "../../common/DropdownMenu";

const NAV_CONFIG = {
  admin: {
    brand: "EV Battery Swap",
    gradient: "from-blue-600 via-indigo-600 to-purple-600",
    menu: [
      { key: PATHS.ADMIN.DASHBOARD, label: "Dashboard" },
      {
        key: PATHS.ADMIN.USERS.ROOT,
        label: "Người dùng",
        children: [
          { key: PATHS.ADMIN.USERS.LIST, label: "Danh sách" },
          { key: PATHS.ADMIN.USERS.CREATE, label: "Thêm mới" },
        ],
      },
      { key: PATHS.ADMIN.SETTINGS, label: "Cài đặt" },
    ],
    userMenu: [
      { key: PATHS.ADMIN.PROFILE, label: "Hồ sơ" },
      { key: "logout", label: "Đăng xuất" },
    ],
    home: PATHS.ADMIN.DASHBOARD,
    showUser: true,
  },
  staff: {
    brand: "EV Staff",
    gradient: "from-green-600 via-emerald-600 to-teal-600",
    menu: [
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
    ],
    home: PATHS.STAFF.SWAP.ROOT,
    showUser: false,
  },
  driver: {
    brand: "EV Driver",
    gradient: "from-blue-600 via-indigo-600 to-purple-600",
    menu: [
      { key: PATHS.DRIVER.HOME, label: "Home" },
      { key: PATHS.DRIVER.MYCAR, label: "My Car" },
      { key: PATHS.DRIVER.BOOKING, label: "Booking" },
      { key: PATHS.DRIVER.SUBSCRIPTION, label: "Subscription" },
      { key: PATHS.DRIVER.PROFILE, label: "Profile" },
    ],
    home: PATHS.DRIVER.HOME,
    showUser: false,
  },
};

const Navbar = ({ type }) => {
  const config = NAV_CONFIG[type];
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleItemClick = (item) => {
    if (item.key.startsWith("/")) {
      navigate(item.key);
      setMobileOpen(false);
      setUserOpen(false);
    }
    if (item.key === "logout") {
      // Add logout logic here
      navigate("/login");
    }
  };

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 bg-gradient-to-r ${config.gradient} text-white shadow-lg`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          className="text-xl font-bold cursor-pointer"
          onClick={() => navigate(config.home)}
        >
          {config.brand}
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-6">
          {config.menu.map((item) =>
            item.children ? (
              <DropdownMenu
                key={item.key}
                item={item}
                isActive={isActive}
                handleItemClick={handleItemClick}
              />
            ) : (
              <button
                key={item.key}
                onClick={() => handleItemClick(item)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive(item.key)
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            )
          )}
        </div>

        {/* User menu for admin */}
        {config.showUser && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setUserOpen((v) => !v)}
              className="relative w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold"
            >
              U
            </button>
            {userOpen && (
              <div className="absolute right-4 top-14 w-48 bg-white border border-gray-200 rounded-xl shadow-xl p-2 text-gray-700 z-50">
                {config.userMenu.map((u) => (
                  <button
                    key={u.key}
                    onClick={() => handleItemClick(u)}
                    className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50"
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

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
        <div className={`md:hidden border-t border-white/30 bg-gradient-to-r ${config.gradient}`}>
          <div className="px-4 py-3 space-y-1">
            {config.menu.map((item) =>
              item.children ? (
                <div key={item.key}>
                  <button
                    onClick={() => {}}
                    className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-white/80"
                  >
                    {item.label}
                  </button>
                  <div className="pl-3 pt-1">
                    {item.children.map((child) => (
                      <button
                        key={child.key}
                        onClick={() => handleItemClick(child)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                          isActive(child.key)
                            ? "bg-white/20 text-white"
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  key={item.key}
                  onClick={() => handleItemClick(item)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(item.key)
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;