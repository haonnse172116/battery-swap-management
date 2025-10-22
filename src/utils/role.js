import { PATHS } from '../constant/path/pathname';

/**
 * Get default path by user role
 * @param {string|null|undefined} roleRaw - User role from auth state
 * @returns {string} Default path for the role
 */
export const getDefaultPathByRole = (roleRaw) => {
  const role = (roleRaw ?? '').toLowerCase();
  
  switch (role) {
    case 'admin':
      return PATHS.ADMIN.DASHBOARD;
    case 'staff':
      return PATHS.STAFF.DASHBOARD;
    case 'driver':
      return PATHS.DRIVER.HOME;
    default:
      return PATHS.PUBLIC.LANDING;
  }
};

/**
 * Check if user has access to a specific path
 * @param {string} userRole - Current user role
 * @param {string} path - Path to check
 * @returns {boolean} Whether user can access the path
 */
export const canAccessPath = (userRole, path) => {
  if (!userRole || !path) return false;
  
  const role = userRole.toLowerCase();
  const normalizedPath = path.toLowerCase();
  
  // Admin can access admin routes
  if (role === 'admin' && normalizedPath.startsWith('/admin')) {
    return true;
  }
  
  // Staff can access staff routes
  if (role === 'staff' && normalizedPath.startsWith('/staff')) {
    return true;
  }
  
  // Driver can access driver routes
  if (role === 'driver' && normalizedPath.startsWith('/driver')) {
    return true;
  }
  
  return false;
};

/**
 * Get all accessible routes for a role
 * @param {string} role - User role
 * @returns {string[]} Array of accessible paths
 */
export const getAccessibleRoutes = (role) => {
  const normalizedRole = (role ?? '').toLowerCase();
  
  const routeMap = {
    admin: [
      PATHS.ADMIN.DASHBOARD,
      PATHS.ADMIN.STATIONS.LIST,
      PATHS.ADMIN.STATIONS.STATION_BATTERY,
      PATHS.ADMIN.STATIONS.COMPLAINTS,
      PATHS.ADMIN.STATIONS.ADD,
      PATHS.ADMIN.USERS.LIST,
      PATHS.ADMIN.USERS.STATION_STAFF,
      PATHS.ADMIN.USERS.CREATE,
      PATHS.ADMIN.SUBSCRIPTIONS.LIST,
      PATHS.ADMIN.SUBSCRIPTIONS.CREATE,
    ],
    staff: [
      PATHS.STAFF.DASHBOARD,
      PATHS.STAFF.SWAP.CONFIRM,
      PATHS.STAFF.SWAP.PAYMENT,
      PATHS.STAFF.SWAP.HISTORY,
      PATHS.STAFF.INVENTORY.LIST,
      PATHS.STAFF.INVENTORY.STATUS,
    ],
    driver: [
      PATHS.DRIVER.HOME,
      PATHS.DRIVER.BOOKING,
      PATHS.DRIVER.MYCAR,
    ],
  };
  
  return routeMap[normalizedRole] || [];
};