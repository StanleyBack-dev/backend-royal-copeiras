import { SetMetadata } from "@nestjs/common";
import { AuthPermission } from "../enums/auth-permission.enum";

export const AUTH_PERMISSIONS_KEY = "authPermissions";
export const RequirePermissions = (...permissions: AuthPermission[]) =>
  SetMetadata(AUTH_PERMISSIONS_KEY, permissions);
