import { Resolver, Query, Args } from "@nestjs/graphql";
import { GetProfileService } from "../../services/get/get-profile.service";
import { GetProfileInputDto } from "../../dtos/get/get-profile-input.dto";
import { GetProfileResponseDto } from "../../dtos/get/get-profile-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";

@Resolver()
export class GetProfileResolver {
  constructor(private readonly getProfileService: GetProfileService) {}

  @Query(() => GetProfileResponseDto)
  @RequirePermissions(AuthPermission.READ_OWN_PROFILE)
  async getMyProfile(
    @CurrentUser() user: unknown,
  ): Promise<GetProfileResponseDto> {
    return this.getProfileService.findByUser(
      (user as { idUsers: string }).idUsers,
    );
  }

  @Query(() => GetProfileResponseDto)
  @RequirePermissions(AuthPermission.READ_PROFILES)
  async getProfile(
    @CurrentUser() user: unknown,
    @Args("input") input: GetProfileInputDto,
  ): Promise<GetProfileResponseDto> {
    return this.getProfileService.findOne(
      (user as { idUsers: string }).idUsers,
      input,
    );
  }
}
