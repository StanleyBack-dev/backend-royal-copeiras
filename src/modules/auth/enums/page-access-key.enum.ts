import { registerEnumType } from "@nestjs/graphql";

export enum PageAccessKey {
  DASHBOARD = "DASHBOARD",
  LEADS = "LEADS",
  BUDGETS = "BUDGETS",
  CONTRACTS = "CONTRACTS",
  CLIENTS = "CLIENTS",
  EMPLOYEES = "EMPLOYEES",
  USERS = "USERS",
  EVENTS = "EVENTS",
  FINANCES = "FINANCES",
  DEBTS = "DEBTS",
  INVESTMENTS = "INVESTMENTS",
}

export const ALL_PAGE_ACCESS_KEYS: PageAccessKey[] = [
  PageAccessKey.DASHBOARD,
  PageAccessKey.LEADS,
  PageAccessKey.BUDGETS,
  PageAccessKey.CONTRACTS,
  PageAccessKey.CLIENTS,
  PageAccessKey.EMPLOYEES,
  PageAccessKey.USERS,
  PageAccessKey.EVENTS,
  PageAccessKey.FINANCES,
  PageAccessKey.DEBTS,
  PageAccessKey.INVESTMENTS,
];

registerEnumType(PageAccessKey, {
  name: "PageAccessKey",
});
