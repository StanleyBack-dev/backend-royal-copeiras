import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AdminUpdateUserAccessInputDto } from "../../dtos/update/admin-update-user-access-input.dto";
import { AdminUpdateUserAccessMutationResponseDto } from "../../dtos/update/admin-update-user-access-mutation-response.dto";
import { AdminUpdateUserAccessService } from "../../services/update/admin-update-user-access.service";

@Resolver(() => AdminUpdateUserAccessMutationResponseDto)
export class AdminUpdateUserAccessResolver {
  constructor(
    private readonly adminUpdateUserAccessService: AdminUpdateUserAccessService,
  ) {}

  @Mutation(() => AdminUpdateUserAccessMutationResponseDto)
  @RequirePermissions(AuthPermission.MANAGE_USERS)
  async adminUpdateUserAccess(
    @CurrentUser() user: unknown,
    @Args("input") input: AdminUpdateUserAccessInputDto,
  ) {
    const updatedUser = await this.adminUpdateUserAccessService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(updatedUser, RESPONSE_MESSAGES.users.accessUpdated);
  }
}