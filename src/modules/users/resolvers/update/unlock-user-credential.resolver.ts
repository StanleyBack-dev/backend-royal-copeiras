import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { UnlockUserCredentialInputDto } from "../../dtos/update/unlock-user-credential-input.dto";
import { UnlockUserCredentialMutationResponseDto } from "../../dtos/update/unlock-user-credential-mutation-response.dto";
import { UnlockUserCredentialService } from "../../services/update/unlock-user-credential.service";

@Resolver(() => UnlockUserCredentialMutationResponseDto)
export class UnlockUserCredentialResolver {
  constructor(
    private readonly unlockUserCredentialService: UnlockUserCredentialService,
  ) {}

  @Mutation(() => UnlockUserCredentialMutationResponseDto)
  @RequirePermissions(AuthPermission.MANAGE_USERS)
  async unlockUserCredential(
    @CurrentUser() user: unknown,
    @Args("input") input: UnlockUserCredentialInputDto,
  ) {
    const result = await this.unlockUserCredentialService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(result, RESPONSE_MESSAGES.users.unlocked);
  }
}
