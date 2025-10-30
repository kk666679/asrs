import { SetMetadata } from '@nestjs/common';
import { Permission } from './permissions';

export const PERMISSION_REQUIREMENT_KEY = 'permissionRequirement';

export interface PermissionRequirement {
  permissions: Permission[];
  requireAll?: boolean;
}

/**
 * Decorator to require specific permissions on a route handler
 * @param permissions - Array of permissions required
 * @param requireAll - If true, user must have ALL permissions; if false, user must have ANY (default: false)
 */
export const RequirePermissions = (
  permissions: Permission[],
  requireAll: boolean = false,
) => SetMetadata(PERMISSION_REQUIREMENT_KEY, { permissions, requireAll });

/**
 * Decorator to require a single permission
 * @param permission - The permission required
 */
export const RequirePermission = (permission: Permission) =>
  RequirePermissions([permission], true);

/**
 * Decorator to require any of the specified permissions
 * @param permissions - Array of permissions where user needs at least one
 */
export const RequireAnyPermission = (permissions: Permission[]) =>
  RequirePermissions(permissions, false);

/**
 * Decorator to require all of the specified permissions
 * @param permissions - Array of permissions where user needs all
 */
export const RequireAllPermissions = (permissions: Permission[]) =>
  RequirePermissions(permissions, true);
