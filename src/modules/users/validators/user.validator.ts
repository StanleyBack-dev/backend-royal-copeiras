import { AppException } from "../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../common/exceptions/app-errors.catalog";
import { UserEntity } from "../entities/user.entity";

export class UserValidator {
  static ensureIsActive(user: UserEntity): void {
    if (!user.status) {
      throw AppException.from(APP_ERRORS.users.inactiveUser, undefined);
    }
  }

  static ensureHasEmail(user: UserEntity): void {
    if (!user.email || !user.email.includes("@")) {
      throw AppException.from(APP_ERRORS.users.invalidEmail, undefined);
    }
  }
}
