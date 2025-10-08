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
  STAFF: {
    ROOT: "/staff",
    DASHBOARD: "/staff/dashboard",
    SWAP: {
      // HOME: "/staff/swap",
      PAYMENT: "/staff/swap/payment",
      HISTORY: "/staff/swap/history",
      RETURN: "/staff/swap/return",
      CONFIRM: "/staff/swap/confirm",
    },
    INVENTORY: {
      ROOT: "/staff/inventory",
      CLASSIFY: "/staff/inventory/classify",
      QUANTITY: "/staff/inventory/quantity",
    },
    PROFILE: "/staff/profile",
  },
  DRIVER: {
    ROOT: "/driver",
    HOME: "/driver/home",
    MYCAR: "/driver/mycar",
    BOOKING: "/driver/booking",
    SUBSCRIPTION: "/driver/subscription",
    PROFILE: "/driver/profile",
  }
};
