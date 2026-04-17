import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { UpdateProfileService } from "../../services/update/update-profile.service";
import { UpdateProfileInputDto } from "../../dtos/update/update-profile-input.dto";
import { UpdateProfileMutationResponseDto } from "../../dtos/update/update-profile-mutation-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";

@Resolver(() => UpdateProfileMutationResponseDto)
export class UpdateProfileResolver {
  constructor(private readonly updateProfileService: UpdateProfileService) {}

  @Mutation(() => UpdateProfileMutationResponseDto)
  @RequirePermissions(AuthPermission.MANAGE_OWN_PROFILE)
  async updateMyProfile(
    @CurrentUser() user: unknown,
    @Args("input") input: UpdateProfileInputDto,
  ) {
    const profile = await this.updateProfileService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(profile, RESPONSE_MESSAGES.profiles.updated);
  }
}
