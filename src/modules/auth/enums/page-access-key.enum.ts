import { registerEnumType } from "@nestjs/graphql";

export enum PageAccessKey {
  DASHBOARD = "DASHBOARD",
  LEADS = "LEADS",
  BUDGETS = "BUDGETS",
  CONTRACTS = "CONTRACTS",
  CLIENTS = "CLIENTS",
  EMPLOYEES = "EMPLOYEES",
  POSITIONS = "POSITIONS",
  USERS = "USERS",
  EVENTS = "EVENTS",
  PAYMENTS = "PAYMENTS",
  PUBLIC_INTAKE = "PUBLIC_INTAKE",
}

export const ALL_PAGE_ACCESS_KEYS: PageAccessKey[] = [
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
];

registerEnumType(PageAccessKey, {
  name: "PageAccessKey",
});
