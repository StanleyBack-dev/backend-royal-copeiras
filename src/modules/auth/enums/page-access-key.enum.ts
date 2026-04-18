import { registerEnumType } from "@nestjs/graphql";

export enum PageAccessKey {
  DASHBOARD = "DASHBOARD",
  CLIENTS = "CLIENTS",
  EMPLOYEES = "EMPLOYEES",
  USERS = "USERS",
  EVENTS = "EVENTS",
  FINANCES = "FINANCES",
  DEBTS = "DEBTS",
  INVESTMENTS = "INVESTMENTS",
}

registerEnumType(PageAccessKey, {
  name: "PageAccessKey",
});

export const ALL_PAGE_ACCESS_KEYS: PageAccessKey[] = [
  PageAccessKey.DASHBOARD,
  PageAccessKey.CLIENTS,
  PageAccessKey.EMPLOYEES,
  PageAccessKey.USERS,
  PageAccessKey.EVENTS,
  PageAccessKey.FINANCES,
  PageAccessKey.DEBTS,
  PageAccessKey.INVESTMENTS,
];
