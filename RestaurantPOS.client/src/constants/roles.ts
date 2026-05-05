export const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  STAFF: 'Staff',
  CHEF: 'Chef'
};

export const ROUTE_PERMISSIONS = {
  // Admin only
  '/statistics': [ROLES.ADMIN],
  '/users': [ROLES.ADMIN],

  // Admin + Manager
  '/inventory': [ROLES.ADMIN, ROLES.MANAGER],
  '/products': [ROLES.ADMIN, ROLES.MANAGER, ROLES.CHEF],
  '/categories': [ROLES.ADMIN, ROLES.MANAGER],
  '/suppliers': [ROLES.ADMIN, ROLES.MANAGER],

  // Operations
  '/orders': [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF],
  '/tables': [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF],
  '/kitchen': [ROLES.ADMIN, ROLES.CHEF],

  // Everyone
  '/profile': [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF, ROLES.CHEF],
  '/change-password': [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF, ROLES.CHEF],
};
