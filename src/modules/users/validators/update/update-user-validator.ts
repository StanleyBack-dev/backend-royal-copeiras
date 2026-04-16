import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { UpdateUserInputDto } from "../../dtos/update/update-user-input.dto";

export class UpdateUserValidator {
  static ensureValidUpdate(input: UpdateUserInputDto): void {
    if (!input.name && !input.urlAvatar && input.status === undefined) {
      throw AppException.from(APP_ERRORS.users.invalidUpdateInput, undefined);
    }
  }
}
