import { UserGroup } from "../../users/enums/user-group.enum";
import { AuthPermission } from "../enums/auth-permission.enum";

export const GROUP_PERMISSIONS: Record<UserGroup, AuthPermission[]> = {
  [UserGroup.USER]: [
    AuthPermission.CHANGE_OWN_PASSWORD,
    AuthPermission.LOGOUT,
    AuthPermission.MANAGE_OWN_PROFILE,
    AuthPermission.MANAGE_OWN_USER,
    AuthPermission.READ_OWN_PROFILE,
    AuthPermission.READ_OWN_USER,
  ],
  [UserGroup.ADMIN]: [
    AuthPermission.CHANGE_OWN_PASSWORD,
    AuthPermission.LOGOUT,
    AuthPermission.MANAGE_CUSTOMERS,
    AuthPermission.MANAGE_EMPLOYEES,
    AuthPermission.MANAGE_OWN_PROFILE,
    AuthPermission.MANAGE_OWN_USER,
    AuthPermission.MANAGE_USERS,
    AuthPermission.READ_CUSTOMERS,
    AuthPermission.READ_EMPLOYEES,
    AuthPermission.READ_OWN_PROFILE,
    AuthPermission.READ_OWN_USER,
    AuthPermission.READ_PROFILES,
    AuthPermission.READ_USERS,
  ],
  [UserGroup.ADMIN_MASTER]: [
    AuthPermission.CHANGE_OWN_PASSWORD,
    AuthPermission.LOGOUT,
    AuthPermission.MANAGE_CUSTOMERS,
    AuthPermission.MANAGE_EMPLOYEES,
    AuthPermission.MANAGE_OWN_PROFILE,
    AuthPermission.MANAGE_OWN_USER,
    AuthPermission.MANAGE_USERS,
    AuthPermission.READ_CUSTOMERS,
    AuthPermission.READ_EMPLOYEES,
    AuthPermission.READ_OWN_PROFILE,
    AuthPermission.READ_OWN_USER,
    AuthPermission.READ_PROFILES,
    AuthPermission.READ_USERS,
  ],
};
