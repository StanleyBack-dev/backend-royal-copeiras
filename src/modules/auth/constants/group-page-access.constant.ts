import { UserGroup } from "../../users/enums/user-group.enum";
import { PageAccessKey } from "../enums/page-access-key.enum";

export const GROUP_DEFAULT_PAGE_ACCESS: Record<UserGroup, PageAccessKey[]> = {
  [UserGroup.USER]: [
    PageAccessKey.DASHBOARD,
    PageAccessKey.EVENTS,
    PageAccessKey.FINANCES,
    PageAccessKey.DEBTS,
    PageAccessKey.INVESTMENTS,
  ],
  [UserGroup.ADMIN]: [
    PageAccessKey.DASHBOARD,
    PageAccessKey.CLIENTS,
    PageAccessKey.EMPLOYEES,
    PageAccessKey.USERS,
    PageAccessKey.EVENTS,
    PageAccessKey.FINANCES,
    PageAccessKey.DEBTS,
    PageAccessKey.INVESTMENTS,
  ],
  [UserGroup.ADMIN_MASTER]: [
    PageAccessKey.DASHBOARD,
    PageAccessKey.CLIENTS,
    PageAccessKey.EMPLOYEES,
    PageAccessKey.USERS,
    PageAccessKey.EVENTS,
    PageAccessKey.FINANCES,
    PageAccessKey.DEBTS,
    PageAccessKey.INVESTMENTS,
  ],
};
