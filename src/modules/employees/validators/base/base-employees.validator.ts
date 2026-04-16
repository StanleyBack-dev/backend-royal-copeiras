import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";

export class EmployeesBaseValidator {
  static validateDocument(document: string): void {
    if (!/^\d{11}$/.test(document)) {
      throw AppException.from(
        APP_ERRORS.validation.documentMustContain11Digits,
        undefined,
      );
    }
  }
}
