import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { PATHS } from "../../../constant/path/pathname";
import { useLogoutMutation } from "../../../services/auth.service";
import { logout as logoutAction } from "../../../redux/slices/authSlice";
import DropdownMenu from "../../common/DropdownMenu";
import {
  HomeIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  BuildingStorefrontIcon,
  ArrowLeftOnRectangleIcon,
  Squares2X2Icon,
  TruckIcon,
  ClipboardDocumentListIcon,
  ReceiptPercentIcon,
  Battery100Icon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const NAV_CONFIG = {
  admin: {
    brand: "EV Admin",
    gradient: "from-blue-600 to-blue-400",
    menu: [
      { key: PATHS.ADMIN.DASHBOARD, label: "Thống kê", icon: Squares2X2Icon },
      {
        key: "stations",
        label: "Trạm",
        icon: BuildingStorefrontIcon,
        children: [
          { key: PATHS.ADMIN.STATIONS.ADD, label: "Thêm mới" },
          { key: PATHS.ADMIN.STATIONS.LIST, label: "Danh sách" },
          { key: PATHS.ADMIN.STATIONS.STATION_BATTERY, label: "Điều phối pin cho trạm" },
          { key: PATHS.ADMIN.STATIONS.COMPLAINTS, label: "Xử lý khiếu nại" },
        ],
      },
      {
        key: "users",
        label: "Người dùng",
        icon: UserGroupIcon,
        children: [
          { key: PATHS.ADMIN.USERS.CREATE, label: "Thêm mới" },
          { key: PATHS.ADMIN.USERS.LIST, label: "Danh sách" },
          { key: PATHS.ADMIN.USERS.STATION_STAFF, label: "Phân trạm nhân viên" },
        ],
      },
      {
        key: "batteries",
        label: "Pin xe",
        icon: Battery100Icon,
        children: [
          { key: PATHS.ADMIN.BATTERY.ADD, label: "Thêm mới" },
          { key: PATHS.ADMIN.BATTERY.LIST, label: "Danh sách" },
        ],
      },
      {
        key: "subscriptions",
        label: "Gói đăng ký",
        icon: ReceiptPercentIcon,
        children: [
          { key: PATHS.ADMIN.SUBSCRIPTIONS.CREATE, label: "Thêm mới" },
          { key: PATHS.ADMIN.SUBSCRIPTIONS.LIST, label: "Danh sách" },
        ],
      },
    ],
    userMenu: [
      { key: PATHS.ADMIN.PROFILE, label: "Hồ sơ", icon: UserCircleIcon },
      { key: "logout", label: "Đăng xuất", icon: ArrowLeftOnRectangleIcon },
    ],
    home: PATHS.ADMIN.DASHBOARD,
    showUser: true,
  },
  staff: {
    brand: "EV Staff",
    gradient: "from-blue-600 to-blue-400",
    menu: [
      { key: PATHS.STAFF.DASHBOARD, label: "Thống kê", icon: Squares2X2Icon },
      {
        key: "swap",
        label: "Giao dịch đổi pin",
        icon: Battery100Icon,
        children: [
          { key: PATHS.STAFF.SWAP.CONFIRM, label: "Yêu cầu đổi pin" },
          { key: PATHS.STAFF.SWAP.PAYMENT, label: "Yêu cầu giao dịch" },
          { key: PATHS.STAFF.SWAP.HISTORY, label: "Lịch sử giao dịch" },
        ],
      },
      {
        key: "inventory",
        label: "Kho pin",
        icon: ClipboardDocumentListIcon,
        children: [
          { key: PATHS.STAFF.INVENTORY.LIST, label: "Danh sách pin" },
          { key: PATHS.STAFF.INVENTORY.STATUS, label: "Quản lý tình trạng" },
          { key: PATHS.STAFF.INVENTORY.SLOT_MANAGE, label: "Quản lý slot pin" },
        ],
      },
    ],
    userMenu: [
      { key: PATHS.STAFF.PROFILE, label: "Hồ sơ", icon: UserCircleIcon },
      { key: "logout", label: "Đăng xuất", icon: ArrowLeftOnRectangleIcon },
    ],
    home: PATHS.STAFF.DASHBOARD,
    showUser: true,
  },
  driver: {
    brand: "EV Driver",
    gradient: "from-indigo-600 via-blue-400 to-blue-500",
    menu: [
      { key: PATHS.DRIVER.HOME, label: "Trang chủ", icon: HomeIcon },
      { key: PATHS.DRIVER.MYCAR, label: "Xe của tôi", icon: TruckIcon },
      { key: PATHS.DRIVER.BOOKING, label: "Đặt lịch", icon: ClipboardDocumentListIcon },
      { key: PATHS.DRIVER.BOOKINGPAGE, label: "Danh sách đặt lịch", icon: ClipboardDocumentListIcon },
      { key: PATHS.DRIVER.MYSWAPS, label: "Lịch sử đổi pin", icon: ReceiptPercentIcon },
      { key: PATHS.DRIVER.SUBSCRIPTION, label: "Đăng ký gói", icon: Battery100Icon },
    ],
    userMenu: [
      { key: PATHS.DRIVER.PROFILE, label: "Cá nhân", icon: UserCircleIcon },
      { key: "logout", label: "Đăng xuất", icon: ArrowLeftOnRectangleIcon },
    ],
    home: PATHS.DRIVER.HOME,
    showUser: true,
  },
};

const Navbar = ({ type }) => {
  const config = NAV_CONFIG[type];
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  
  // ✅ Add logout mutation
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const isActive = (path) => location.pathname === path;
  
  const isParentActive = (item) => {
    if (!item.children) return false;
    return item.children.some(child => isActive(child.key));
  };

  const handleItemClick = (item) => {
    if (item.key.startsWith("/")) {
      navigate(item.key);
      setMobileOpen(false);
      setUserOpen(false);
    }
  };

  // ✅ Handle logout
  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(logoutAction());
      setMobileOpen(false);
      setUserOpen(false);
      navigate(PATHS.AUTH.LOGIN, { replace: true });
    } catch (error) {
      console.error('Logout API failed:', error);
      dispatch(logoutAction());
      navigate(PATHS.AUTH.LOGIN, { replace: true });
    }
  };

  const handleUserMenuClick = (item) => {
    if (item.key === "logout") {
      handleLogout();
    } else {
      handleItemClick(item);
    }
  };

  const toggleDropdown = (key) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 bg-gradient-to-r ${config.gradient} text-white shadow-lg`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          className="text-xl font-bold cursor-pointer hover:text-white/90 transition"
          onClick={() => navigate(config.home)}
        >
          {config.brand}
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-2">
          {config.menu.map((item) => {
            const Icon = item.icon;
            
            if (item.children) {
              return (
                <div key={item.key} className="relative">
                  <button
                    onClick={() => toggleDropdown(item.key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                      isParentActive(item) || openDropdowns[item.key]
                        ? "bg-white/20 text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{item.label}</span>
                    <span className="ml-1">{openDropdowns[item.key] ? "▾" : "▸"}</span>
                  </button>
                  
                  {openDropdowns[item.key] && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50">
                      {item.children.map((child) => (
                        <button
                          key={child.key}
                          onClick={() => {
                            handleItemClick(child);
                            setOpenDropdowns({});
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition ${
                            isActive(child.key)
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.key}
                onClick={() => handleItemClick(item)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive(item.key)
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User menu */}
        {config.showUser && (
          <div className="relative flex items-center gap-3">
            <button
              onClick={() => setUserOpen(!userOpen)}
              className="relative w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold hover:bg-white/30 transition"
            >
              <UserCircleIcon className="w-6 h-6" />
            </button>
            
            {userOpen && (
              <div className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-xl shadow-xl py-2 text-gray-700 z-50">
                {config.userMenu.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleUserMenuClick(item)}
                      disabled={item.key === "logout" && isLoggingOut}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      <span>
                        {item.key === "logout" && isLoggingOut ? "Đang đăng xuất..." : item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Mobile menu button */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-md hover:bg-white/10 transition"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={`md:hidden border-t border-white/30 bg-gradient-to-r ${config.gradient}`}>
          <div className="px-4 py-3 space-y-1 max-h-[calc(100vh-64px)] overflow-y-auto">
            {config.menu.map((item) => {
              const Icon = item.icon;
              
              if (item.children) {
                return (
                  <div key={item.key}>
                    <button
                      onClick={() => toggleDropdown(`mobile-${item.key}`)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                        isParentActive(item) || openDropdowns[`mobile-${item.key}`]
                          ? "bg-white/20 text-white"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {Icon && <Icon className="w-5 h-5" />}
                      <span className="flex-1 text-left">{item.label}</span>
                      <span>{openDropdowns[`mobile-${item.key}`] ? "▾" : "▸"}</span>
                    </button>
                    
                    {openDropdowns[`mobile-${item.key}`] && (
                      <div className="pl-8 space-y-1 mt-1">
                        {item.children.map((child) => (
                          <button
                            key={child.key}
                            onClick={() => handleItemClick(child)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${
                              isActive(child.key)
                                ? "bg-white/30 text-white font-medium"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            {child.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.key}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive(item.key)
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            {/* Mobile user menu */}
            {config.showUser && (
              <>
                <hr className="my-3 border-white/20" />
                <div className="space-y-1">
                  {config.userMenu.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.key}
                        onClick={() => handleUserMenuClick(item)}
                        disabled={item.key === "logout" && isLoggingOut}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {Icon && <Icon className="w-5 h-5" />}
                        <span>
                          {item.key === "logout" && isLoggingOut ? "Đang đăng xuất..." : item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {(Object.values(openDropdowns).some(Boolean) || userOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setOpenDropdowns({});
            setUserOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;