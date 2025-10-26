// src/constants/pathname.js
export const PATHS = {
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    VERIFY_OTP: "/verify-otp",
  },
  ADMIN: {
    ROOT: "/admin",
    DASHBOARD: "/admin/dashboard",
    STATIONS: {
      ROOT: "/admin/stations",
      LIST: "/admin/stations/list",
      STATION_BATTERY: "/admin/stations/station-battery",
      COMPLAINTS: "/admin/stations/complaints",
      ADD: "/admin/stations/create",
    },
    USERS: {
      ROOT: "/admin/users",
      LIST: "/admin/users/list",
      STATION_STAFF: "/admin/users/station-staff",
      CREATE: "/admin/users/create",
    },
    SUBSCRIPTIONS: {
      ROOT: "/admin/subscriptions",
      LIST: "/admin/subscriptions/list",
      CREATE: "/admin/subscriptions/create",
    },
    SETTINGS: "/admin/settings",
    PROFILE: "/admin/profile",
  },
  PUBLIC: {
    LANDING: "/",
    ABOUT: "/about",
  },
  STAFF: {
    ROOT: "/staff",
    DASHBOARD: "/staff/dashboard",
    SWAP: {
      // HOME: "/staff/swap",
      CONFIRM: "/staff/swap/confirm",
      PAYMENT: "/staff/swap/payment",
      HISTORY: "/staff/swap/history",
      // RETURN: "/staff/swap/return",
    },
    INVENTORY: {
      ROOT: "/staff/inventory",
      LIST: "/staff/inventory/battery-list",
      STATUS: "/staff/inventory/battery-status",
    },
    PROFILE: "/staff/profile",
  },
  DRIVER: {
    ROOT: "/driver",
    HOME: "/driver/home",
    MYCAR: "/driver/mycar",
    BOOKING: "/driver/booking",
    BOOKINGPAGE: "/driver/booking-page",
    SUBSCRIPTION: "/driver/subscription",
    PROFILE: "/driver/profile",
  }
};
