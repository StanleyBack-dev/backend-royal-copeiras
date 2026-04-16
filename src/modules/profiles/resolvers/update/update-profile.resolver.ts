import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { UpdateProfileService } from "../../services/update/update-profile.service";
import { UpdateProfileInputDto } from "../../dtos/update/update-profile-input.dto";
import { UpdateProfileResponseDto } from "../../dtos/update/update-profile-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";

@Resolver()
export class UpdateProfileResolver {
  constructor(private readonly updateProfileService: UpdateProfileService) {}

  @Mutation(() => UpdateProfileResponseDto)
  @RequirePermissions(AuthPermission.MANAGE_OWN_PROFILE)
  async updateMyProfile(
    @CurrentUser() user: unknown,
    @Args("input") input: UpdateProfileInputDto,
  ): Promise<UpdateProfileResponseDto> {
    return this.updateProfileService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );
  }
}
