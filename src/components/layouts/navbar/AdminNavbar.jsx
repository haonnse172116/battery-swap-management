import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "../../../constant/path/pathname";
import DropdownMenu from "../../common/DropdownMenu";

// tạm data menu
const menuItems = [
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
];

const userMenuItems = [
  { key: PATHS.ADMIN.PROFILE, label: "Hồ sơ" },
  { key: "logout", label: "Đăng xuất" },
];

const AdminNavbar = () => {
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
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          className="text-xl font-bold cursor-pointer"
          onClick={() => navigate(PATHS.ADMIN.DASHBOARD)}
        >
          EV Battery Swap
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-6">
          {menuItems.map((item) => (
             <DropdownMenu
              key={item.key}
              item={item}
              isActive={isActive}
              handleItemClick={handleItemClick}
            />
          ))}
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setUserOpen((v) => !v)}
            className="relative w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold"
          >
            U
          </button>
          {userOpen && (
            <div className="absolute right-4 top-14 w-48 bg-white border border-gray-200 rounded-xl shadow-xl p-2 text-gray-700 z-50">
              {userMenuItems.map((u) => (
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

          {/* Burger mobile */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center border border-white/40 rounded-md"
            onClick={() => setMobileOpen((v) => !v)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/30 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
          <div className="px-4 py-3 space-y-1">
            {menuItems.map((item) => (
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

export default AdminNavbar;
