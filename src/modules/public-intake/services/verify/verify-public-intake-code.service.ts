import { Injectable } from "@nestjs/common";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { PublicIntakeCodesService } from "../public-intake-codes.service";

@Injectable()
export class VerifyPublicIntakeCodeService {
  constructor(
    private readonly publicIntakeCodesService: PublicIntakeCodesService,
  ) {}

  async execute(code: string) {
    const activeCode =
      await this.publicIntakeCodesService.findActiveByCode(code);

    if (!activeCode) {
      throw AppException.from(
        APP_ERRORS.publicIntake.codeInvalidOrExpired,
        undefined,
      );
    }

    return this.publicIntakeCodesService.markVerified(activeCode);
  }
}
