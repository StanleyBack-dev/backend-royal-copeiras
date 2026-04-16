import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";

export class CustomersBaseValidator {
  static validateRanges(weight: number): void {
    if (weight < 20 || weight > 300) {
      throw AppException.from(
        APP_ERRORS.validation.customerWeightOutOfRange,
        undefined,
      );
    }
  }

  static validateDate(date: string): void {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      throw AppException.from(APP_ERRORS.validation.invalidDate, undefined);
    }
    const now = new Date();
    if (parsed > now) {
      throw AppException.from(
        APP_ERRORS.validation.futureDateNotAllowed,
        undefined,
      );
    }
  }
}
