// Permission definitions for the ASRS Halal Inventory Management System

export enum Permission {
  // User Management
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_MANAGE_ROLES = 'user:manage_roles',

  // Product Management
  PRODUCT_CREATE = 'product:create',
  PRODUCT_READ = 'product:read',
  PRODUCT_UPDATE = 'product:update',
  PRODUCT_DELETE = 'product:delete',

  // Inventory Management
  INVENTORY_READ = 'inventory:read',
  INVENTORY_UPDATE = 'inventory:update',
  INVENTORY_ADJUST = 'inventory:adjust',
  INVENTORY_COUNT = 'inventory:count',

  // Warehouse Management
  WAREHOUSE_READ = 'warehouse:read',
  WAREHOUSE_UPDATE = 'warehouse:update',
  WAREHOUSE_MANAGE_LOCATIONS = 'warehouse:manage_locations',

  // Robot Management
  ROBOT_READ = 'robot:read',
  ROBOT_COMMAND = 'robot:command',
  ROBOT_MAINTENANCE = 'robot:maintenance',

  // Shipment Management
  SHIPMENT_CREATE = 'shipment:create',
  SHIPMENT_READ = 'shipment:read',
  SHIPMENT_UPDATE = 'shipment:update',
  SHIPMENT_PROCESS = 'shipment:process',

  // Supplier Management
  SUPPLIER_CREATE = 'supplier:create',
  SUPPLIER_READ = 'supplier:read',
  SUPPLIER_UPDATE = 'supplier:update',

  // Halal Compliance
  HALAL_CERTIFICATE_READ = 'halal:certificate:read',
  HALAL_CERTIFICATE_MANAGE = 'halal:certificate:manage',
  HALAL_COMPLIANCE_AUDIT = 'halal:compliance:audit',

  // Reporting
  REPORT_READ = 'report:read',
  REPORT_ADVANCED = 'report:advanced',

  // System Administration
  SYSTEM_CONFIG = 'system:config',
  SYSTEM_BACKUP = 'system:backup',
  SYSTEM_MAINTENANCE = 'system:maintenance',

  // Audit
  AUDIT_READ = 'audit:read',
  AUDIT_ADMIN = 'audit:admin',
}

// Role-based permission mappings
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: [
    // All permissions
    ...Object.values(Permission),
  ],
  MANAGER: [
    // User management (limited)
    Permission.USER_READ,
    Permission.USER_UPDATE,

    // Full product and inventory management
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_READ,
    Permission.PRODUCT_UPDATE,
    Permission.PRODUCT_DELETE,
    Permission.INVENTORY_READ,
    Permission.INVENTORY_UPDATE,
    Permission.INVENTORY_ADJUST,
    Permission.INVENTORY_COUNT,

    // Warehouse management
    Permission.WAREHOUSE_READ,
    Permission.WAREHOUSE_UPDATE,
    Permission.WAREHOUSE_MANAGE_LOCATIONS,

    // Robot management
    Permission.ROBOT_READ,
    Permission.ROBOT_COMMAND,

    // Full shipment management
    Permission.SHIPMENT_CREATE,
    Permission.SHIPMENT_READ,
    Permission.SHIPMENT_UPDATE,
    Permission.SHIPMENT_PROCESS,

    // Supplier management
    Permission.SUPPLIER_CREATE,
    Permission.SUPPLIER_READ,
    Permission.SUPPLIER_UPDATE,

    // Halal compliance
    Permission.HALAL_CERTIFICATE_READ,
    Permission.HALAL_CERTIFICATE_MANAGE,
    Permission.HALAL_COMPLIANCE_AUDIT,

    // Reporting
    Permission.REPORT_READ,
    Permission.REPORT_ADVANCED,

    // Audit
    Permission.AUDIT_READ,
  ],
  OPERATOR: [
    // Read permissions
    Permission.PRODUCT_READ,
    Permission.INVENTORY_READ,
    Permission.WAREHOUSE_READ,
    Permission.ROBOT_READ,
    Permission.SHIPMENT_READ,
    Permission.SUPPLIER_READ,
    Permission.HALAL_CERTIFICATE_READ,
    Permission.REPORT_READ,

    // Limited update permissions
    Permission.INVENTORY_UPDATE,
    Permission.INVENTORY_COUNT,
    Permission.SHIPMENT_UPDATE,
    Permission.SHIPMENT_PROCESS,

    // Robot commands
    Permission.ROBOT_COMMAND,
  ],
  VIEWER: [
    // Read-only permissions
    Permission.PRODUCT_READ,
    Permission.INVENTORY_READ,
    Permission.WAREHOUSE_READ,
    Permission.ROBOT_READ,
    Permission.SHIPMENT_READ,
    Permission.SUPPLIER_READ,
    Permission.HALAL_CERTIFICATE_READ,
    Permission.REPORT_READ,
    Permission.AUDIT_READ,
  ],
};

// Helper functions
export function getPermissionsForRole(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function hasPermission(
  userPermissions: Permission[],
  requiredPermission: Permission,
): boolean {
  return userPermissions.includes(requiredPermission);
}

export function hasAnyPermission(
  userPermissions: Permission[],
  requiredPermissions: Permission[],
): boolean {
  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission),
  );
}

export function hasAllPermissions(
  userPermissions: Permission[],
  requiredPermissions: Permission[],
): boolean {
  return requiredPermissions.every((permission) =>
    userPermissions.includes(permission),
  );
}
