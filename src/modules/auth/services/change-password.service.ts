import { Injectable } from "@nestjs/common";
import { AppException } from "../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../common/exceptions/app-errors.catalog";
import { AuthPermission } from "../enums/auth-permission.enum";
import { ChangePasswordInputDto } from "../dtos/password/change-password-input.dto";
import { AuthCredentialsService } from "./auth-credentials.service";
import { AuthorizationService } from "./authorization.service";
import { PasswordHasherService } from "./password-hasher.service";

@Injectable()
export class ChangePasswordService {
  constructor(
    private readonly authCredentialsService: AuthCredentialsService,
    private readonly authorizationService: AuthorizationService,
    private readonly passwordHasherService: PasswordHasherService,
  ) {}

  async execute(idUsers: string, input: ChangePasswordInputDto): Promise<void> {
    await this.authorizationService.assertPermissionForUserId(
      idUsers,
      AuthPermission.CHANGE_OWN_PASSWORD,
    );

    if (input.currentPassword === input.newPassword) {
      throw AppException.from(APP_ERRORS.auth.newPasswordMustDiffer, undefined);
    }

    const credential =
      await this.authCredentialsService.findByUserIdOrFail(idUsers);
    const passwordMatches = await this.passwordHasherService.verifyPassword(
      input.currentPassword,
      credential.passwordHash,
    );

    if (!passwordMatches) {
      throw AppException.from(
        APP_ERRORS.auth.invalidCurrentPassword,
        undefined,
      );
    }

    const nextPasswordHash = await this.passwordHasherService.hashPassword(
      input.newPassword,
    );

    await this.authCredentialsService.updatePassword(
      credential,
      nextPasswordHash,
    );
  }
}
