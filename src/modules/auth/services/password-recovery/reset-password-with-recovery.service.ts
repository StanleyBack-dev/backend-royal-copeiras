import { Injectable } from "@nestjs/common";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { AuthCredentialsService } from "../auth-credentials.service";
import { PasswordHasherService } from "../password-hasher.service";
import { PasswordRecoveryCodesService } from "./password-recovery-codes.service";

@Injectable()
export class ResetPasswordWithRecoveryService {
  constructor(
    private readonly passwordRecoveryCodesService: PasswordRecoveryCodesService,
    private readonly authCredentialsService: AuthCredentialsService,
    private readonly passwordHasherService: PasswordHasherService,
  ) {}

  async execute(recoveryToken: string, newPassword: string): Promise<void> {
    const activeRecovery =
      await this.passwordRecoveryCodesService.findByResetToken(recoveryToken);

    if (!activeRecovery) {
      throw AppException.from(
        APP_ERRORS.auth.passwordRecoveryNotAllowed,
        undefined,
      );
    }

    const credential = await this.authCredentialsService.findByUserIdOrFail(
      activeRecovery.idUsers,
    );

    if (!credential.user.status || credential.user.inactivatedAt) {
      throw AppException.from(APP_ERRORS.auth.inactiveUser, undefined);
    }

    const nextPasswordHash =
      await this.passwordHasherService.hashPassword(newPassword);

    await this.authCredentialsService.updatePassword(
      credential,
      nextPasswordHash,
    );
    await this.passwordRecoveryCodesService.consume(activeRecovery);
  }
}
