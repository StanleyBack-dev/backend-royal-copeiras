import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { UpdateUserService } from "../../services/update/update-user.service";
import { UpdateUserInputDto } from "../../dtos/update/update-user-input.dto";
import { UpdateUserMutationResponseDto } from "../../dtos/update/update-user-mutation-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";

@Resolver(() => UpdateUserMutationResponseDto)
export class UpdateUserResolver {
  constructor(private readonly updateUserService: UpdateUserService) {}

  @Mutation(() => UpdateUserMutationResponseDto)
  @RequirePermissions(AuthPermission.MANAGE_OWN_USER)
  async updateUser(
    @CurrentUser() user: unknown,
    @Args("input") input: UpdateUserInputDto,
  ) {
    const updatedUser = await this.updateUserService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(updatedUser, RESPONSE_MESSAGES.users.updated);
  }
}
