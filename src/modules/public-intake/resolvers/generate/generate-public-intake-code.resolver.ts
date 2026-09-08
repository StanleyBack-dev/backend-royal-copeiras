import { Mutation, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { GeneratePublicIntakeCodeMutationResponseDto } from "../../dtos/generate/generate-public-intake-code-mutation-response.dto";
import { GeneratePublicIntakeCodeService } from "../../services/generate/generate-public-intake-code.service";

@Resolver()
export class GeneratePublicIntakeCodeResolver {
  constructor(
    private readonly generatePublicIntakeCodeService: GeneratePublicIntakeCodeService,
  ) {}

  @Mutation(() => GeneratePublicIntakeCodeMutationResponseDto, {
    name: "generatePublicIntakeCode",
  })
  @RequirePermissions(AuthPermission.MANAGE_LEADS)
  async generatePublicIntakeCode(@CurrentUser() user: unknown) {
    const issued = await this.generatePublicIntakeCodeService.execute(
      (user as { idUsers: string }).idUsers,
    );

    return buildDataResponse(
      issued,
      RESPONSE_MESSAGES.publicIntake.codeGenerated,
    );
  }
}
