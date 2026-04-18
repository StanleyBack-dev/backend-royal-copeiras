import { Injectable } from "@nestjs/common";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { PasswordHasherService } from "../password-hasher.service";
import { PasswordRecoveryCodesService } from "./password-recovery-codes.service";

@Injectable()
export class VerifyPasswordRecoveryCodeService {
  constructor(
    private readonly passwordRecoveryCodesService: PasswordRecoveryCodesService,
    private readonly passwordHasherService: PasswordHasherService,
  ) {}

  async execute(email: string, code: string) {
    const activeCode =
      await this.passwordRecoveryCodesService.findLatestValidCodeForEmail(
        email,
      );

    if (!activeCode) {
      throw AppException.from(
        APP_ERRORS.auth.passwordRecoveryCodeInvalidOrExpired,
        undefined,
      );
    }

    const codeMatches = await this.passwordHasherService.verifyPassword(
      code,
      activeCode.codeHash,
    );

    if (!codeMatches) {
      await this.passwordRecoveryCodesService.registerInvalidAttempt(
        activeCode,
      );
      throw AppException.from(
        APP_ERRORS.auth.passwordRecoveryCodeInvalidOrExpired,
        undefined,
      );
    }

    return this.passwordRecoveryCodesService.markVerified(activeCode);
  }
}
