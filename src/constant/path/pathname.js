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
      LIST: "/admin/users/list",
      CREATE: "/admin/users/create",
    },
    SETTINGS: "/admin/settings",
  },
  PUBLIC: {
    HOME: "/",
    ABOUT: "/about",
  },
  STAFF:{
    ROOT: "/staff",
    SWAP: {
      HOME: "/staff/swap",
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
  }
};
