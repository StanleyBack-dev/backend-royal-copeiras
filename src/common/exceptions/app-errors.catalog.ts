import { AppErrorDefinition } from "./app-error-definition.type";
import { authErrors } from "./catalogs/auth-errors.catalog";
import { authorizationErrors } from "./catalogs/authorization-errors.catalog";
import { customersErrors } from "./catalogs/customers-errors.catalog";
import { employeesErrors } from "./catalogs/employees-errors.catalog";
import { profilesErrors } from "./catalogs/profiles-errors.catalog";
import { usersErrors } from "./catalogs/users-errors.catalog";
import { validationErrors } from "./catalogs/validation-errors.catalog";

export const APP_ERRORS = {
  auth: authErrors,
  authorization: authorizationErrors,
  users: usersErrors,
  profiles: profilesErrors,
  customers: customersErrors,
  employees: employeesErrors,
  validation: validationErrors,
} as const satisfies Record<
  string,
  Record<string, AppErrorDefinition<unknown>>
>;
