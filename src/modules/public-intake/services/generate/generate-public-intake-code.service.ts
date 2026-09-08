import { Injectable } from "@nestjs/common";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { PublicIntakeCodesService } from "../public-intake-codes.service";

@Injectable()
export class GeneratePublicIntakeCodeService {
  constructor(
    private readonly publicIntakeCodesService: PublicIntakeCodesService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(userId: string) {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_LEADS,
    );

    return this.publicIntakeCodesService.issueCode(userId);
  }
}
