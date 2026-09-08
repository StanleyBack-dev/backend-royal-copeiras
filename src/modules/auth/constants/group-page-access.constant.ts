import { UserGroup } from "../../users/enums/user-group.enum";
import { PageAccessKey } from "../enums/page-access-key.enum";

export const GROUP_DEFAULT_PAGE_ACCESS: Record<UserGroup, PageAccessKey[]> = {
  [UserGroup.USER]: [PageAccessKey.DASHBOARD],
  [UserGroup.ADMIN]: [
    PageAccessKey.DASHBOARD,
    PageAccessKey.LEADS,
    PageAccessKey.BUDGETS,
    PageAccessKey.CONTRACTS,
    PageAccessKey.CLIENTS,
    PageAccessKey.EMPLOYEES,
    PageAccessKey.POSITIONS,
    PageAccessKey.EVENTS,
    PageAccessKey.PAYMENTS,
    PageAccessKey.PUBLIC_INTAKE,
  ],
  [UserGroup.ADMIN_MASTER]: [
    PageAccessKey.DASHBOARD,
    PageAccessKey.LEADS,
    PageAccessKey.BUDGETS,
    PageAccessKey.CONTRACTS,
    PageAccessKey.CLIENTS,
    PageAccessKey.EMPLOYEES,
    PageAccessKey.POSITIONS,
    PageAccessKey.USERS,
    PageAccessKey.EVENTS,
    PageAccessKey.PAYMENTS,
    PageAccessKey.PUBLIC_INTAKE,
  ],
};
