import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  Permission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from './permissions';

export interface PermissionRequirement {
  permissions: Permission[];
  requireAll?: boolean; // If true, user must have ALL permissions; if false, user must have ANY
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permissionRequirement = this.reflector.get<PermissionRequirement>(
      'permissionRequirement',
      context.getHandler(),
    );

    if (!permissionRequirement) {
      // No permission requirement specified, allow access
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.permissions) {
      return false;
    }

    const { permissions, requireAll = false } = permissionRequirement;

    if (requireAll) {
      return hasAllPermissions(user.permissions, permissions);
    } else {
      return hasAnyPermission(user.permissions, permissions);
    }
  }
}
