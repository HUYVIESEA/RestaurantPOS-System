export const ROLES = {
  ADMIN: 'Admin',
  CASHIER: 'Cashier',
  CHEF: 'Chef'
};

export const ROUTE_PERMISSIONS = {
  // Admin only
  '/statistics': [ROLES.ADMIN],
  '/users': [ROLES.ADMIN],
  '/inventory': [ROLES.ADMIN],
  '/products': [ROLES.ADMIN],
  '/categories': [ROLES.ADMIN],
  '/suppliers': [ROLES.ADMIN],

  // Shared
  '/orders': [ROLES.ADMIN, ROLES.CASHIER],
  '/tables': [ROLES.ADMIN, ROLES.CASHIER],
  '/kitchen': [ROLES.ADMIN, ROLES.CHEF],

  // Everyone
  '/profile': [ROLES.ADMIN, ROLES.CASHIER, ROLES.CHEF],
  '/change-password': [ROLES.ADMIN, ROLES.CASHIER, ROLES.CHEF],
};
