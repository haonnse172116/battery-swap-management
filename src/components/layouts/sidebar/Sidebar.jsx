import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { PATHS } from "../../../constant/path/pathname";
import { useSidebar } from "../../../contexts/SidebarContext";
import { useLogoutMutation } from "../../../services/auth.service";
import { logout as logoutAction } from "../../../redux/slices/authSlice";
import {
  HomeIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  BuildingStorefrontIcon,
  ArrowLeftStartOnRectangleIcon,
  Squares2X2Icon,
  TruckIcon,
  ClipboardDocumentListIcon,
  ReceiptPercentIcon,
  Battery100Icon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import CarIcon from "../../../constant/svg/Car";

const Sidebar = ({ type }) => {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const [openGroup, setOpenGroup] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // ✅ Add logout mutation
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

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
        // ✅ Add Profile for Admin
        { key: PATHS.ADMIN.PROFILE, label: "Hồ sơ", icon: UserCircleIcon },
        { key: "logout", label: "Đăng xuất", icon: ArrowLeftStartOnRectangleIcon },
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
            // { key: PATHS.STAFF.INVENTORY.STATUS, label: "Quản lý tình trạng" },
            { key: PATHS.STAFF.INVENTORY.SLOT_MANAGE, label: "Quản lý slot pin" },
          ],
        },
      ],
      userMenu: [
        // ✅ Add Profile for Staff
        { key: PATHS.STAFF.PROFILE, label: "Hồ sơ", icon: UserCircleIcon },
        { key: "logout", label: "Đăng xuất", icon: ArrowLeftStartOnRectangleIcon },
      ],
      home: PATHS.STAFF.DASHBOARD,
      showUser: true,
    },
    driver: {
      brand: "EV Driver",
      gradient: "from-indigo-600 via-blue-400 to-blue-500",
      menu: [
        { key: PATHS.DRIVER.HOME, label: "Trang chủ", icon: HomeIcon },
        { key: PATHS.DRIVER.MYCAR, label: "Xe của tôi", icon: CarIcon },
        { key: PATHS.DRIVER.BOOKING, label: "Đặt lịch", icon: ClipboardDocumentListIcon },
        { key: PATHS.DRIVER.BOOKINGPAGE, label: "Danh sách đặt lịch", icon: ClipboardDocumentListIcon },
        { key: PATHS.DRIVER.MYSWAPS, label: "Lịch sử đổi pin", icon: ReceiptPercentIcon },
        { key: PATHS.DRIVER.SUBSCRIPTION, label: "Đăng ký gói", icon: Battery100Icon },
      ],
      userMenu: [
        { key: PATHS.DRIVER.PROFILE, label: "Cá nhân", icon: UserCircleIcon },
        { key: "logout", label: "Đăng xuất", icon: ArrowLeftStartOnRectangleIcon },
      ],
      home: PATHS.DRIVER.HOME,
      showUser: true,
    },
  };

  const config = NAV_CONFIG[type];
  const isActive = (path) => location.pathname === path;

  const handleItemClick = (item) => {
    if (item.children) setOpenGroup(openGroup === item.key ? null : item.key);
    else {
      navigate(item.key);
      setMobileOpen(false);
    }
  };

  // ✅ Handle logout
  const handleLogout = async () => {
    try {
      // Call logout API
      await logout().unwrap();
      
      // Clear Redux state (already done in auth.service.js onQueryStarted)
      // But we can also manually dispatch for safety
      dispatch(logoutAction());
      
      // Close mobile menu
      setMobileOpen(false);
      
      // Navigate to login
      navigate(PATHS.AUTH.LOGIN, { replace: true });
    } catch (error) {
      // Even if API fails, still logout locally
      console.error('Logout API failed:', error);
      dispatch(logoutAction());
      navigate(PATHS.AUTH.LOGIN, { replace: true });
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Sidebar */}
      <div
        style={{
          width: collapsed ? "80px" : "256px",
          transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        className={`fixed top-0 left-0 z-50 h-screen bg-gradient-to-b ${config.gradient} text-white flex flex-col 
          transition-transform duration-300 md:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 font-bold text-lg select-none">
          {/* Brand */}
          <button
            onClick={() => {
              navigate(config.home);
              setMobileOpen(false);
            }}
            className="text-left hover:text-white/90 transition"
          >
            <span
              className={`whitespace-nowrap inline-block overflow-hidden transition-[max-width,opacity,transform] duration-300 ease-in-out ${
                collapsed
                  ? "max-w-0 opacity-0 -translate-x-2"
                  : "max-w-[160px] opacity-100 translate-x-0"
              }`}
            >
              {config.brand}
            </span>
          </button>

          {/* Collapse */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed((v) => !v);
            }}
            className="ml-auto w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 transition"
          >
            {collapsed ? (
              <ArrowRightIcon className="w-5 h-5" />
            ) : (
              <ArrowLeftIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Menu */}
        <nav className={`flex-1 overflow-y-auto transition-all duration-300 ${collapsed ? "px-1" : "px-3"}`}>
          {config.menu.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="py-1">
                <button
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center gap-3 p-2 rounded-md text-sm font-medium transition 
                    ${isActive(item.key) ? "bg-white/20" : "hover:bg-white/10"}`}
                >
                  {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                  <span
                    className={`whitespace-nowrap inline-block overflow-hidden transition-[max-width,opacity,transform] duration-300 ease-in-out ${
                      collapsed
                        ? "max-w-0 opacity-0 -translate-x-2"
                        : "max-w-[160px] opacity-100 translate-x-0"
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.children && !collapsed && (
                    <span className="ml-auto">{openGroup === item.key ? "▾" : "▸"}</span>
                  )}
                </button>

                {item.children && openGroup === item.key && !collapsed && (
                  <div className="pl-8 space-y-1 mt-1 transition-all duration-300">
                    {item.children.map((child) => (
                      <button
                        key={child.key}
                        onClick={() => handleItemClick(child)}
                        className={`block w-full text-left px-3 py-2 rounded-md text-sm transition
                          ${
                            isActive(child.key)
                              ? "bg-white/30 text-white"
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
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/20 text-sm text-white/80">
          {!collapsed ? (
            <>
              {config.showUser && config.userMenu && (
                <div className="flex flex-col space-y-2">
                  {config.userMenu.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          if (item.key === "logout") {
                            handleLogout(); // ✅ Use handleLogout
                          } else {
                            navigate(item.key);
                            setMobileOpen(false);
                          }
                        }}
                        disabled={item.key === "logout" && isLoggingOut}
                        className="flex items-center gap-3 text-left px-3 py-2 rounded-md text-sm hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {Icon && <Icon className="w-5 h-5" />}
                        <span
                          className={`whitespace-nowrap inline-block overflow-hidden transition-[max-width,opacity,transform] duration-300 ease-in-out ${
                            collapsed
                              ? "max-w-0 opacity-0 -translate-x-2"
                              : "max-w-[160px] opacity-100 translate-x-0"
                          }`}
                        >
                          {item.key === "logout" && isLoggingOut ? "Đang đăng xuất..." : item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              <div
                className={`mt-3 text-xs text-white/60 overflow-hidden inline-block transition-[max-width,opacity,transform] duration-300 ease-in-out ${
                  collapsed
                    ? "max-w-0 opacity-0 -translate-x-2"
                    : "max-w-[160px] opacity-100 translate-x-0"
                }`}
              >
                EV Management System
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              {config.showUser && (
                <>
                  <UserCircleIcon
                    onClick={() => navigate(PATHS.DRIVER.PROFILE)}
                    className="w-6 h-6 cursor-pointer hover:text-white"
                  />
                  <ArrowLeftStartOnRectangleIcon
                    onClick={handleLogout} // ✅ Use handleLogout
                    className={`w-6 h-6 cursor-pointer hover:text-white ${
                      isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
