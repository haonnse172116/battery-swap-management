// src/constants/pathname.js
export const PATHS = {
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
  },
  ADMIN: {
    ROOT: "/admin",
    DASHBOARD: "/admin/dashboard",
    USERS: {
      ROOT: "/admin/users",
      LIST: "/admin/users/list",
      CREATE: "/admin/users/create",
    },
    SETTINGS: "/admin/settings",
    PROFILE: "/admin/profile",
  },
  PUBLIC: {
    LANDING: "/",
    ABOUT: "/about",
  },
  STAFF:{
    ROOT: "/staff",
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
  DRIVER:{
    ROOT: "/driver",
    HOME: "/driver/home",
    MYCAR: "/driver/mycar",
    BOOKING: "/driver/booking",
    SUBSCRIPTION: "/driver/subscription",
    PROFILE: "/driver/profile",
  }
};
