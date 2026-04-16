import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { UpdateUserService } from "../../services/update/update-user.service";
import { UpdateUserInputDto } from "../../dtos/update/update-user-input.dto";
import { UpdateUserResponseDto } from "../../dtos/update/update-user-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";

@Resolver()
export class UpdateUserResolver {
  constructor(private readonly updateUserService: UpdateUserService) {}

  @Mutation(() => UpdateUserResponseDto)
  @RequirePermissions(AuthPermission.MANAGE_OWN_USER)
  async updateUser(
    @CurrentUser() user: unknown,
    @Args("input") input: UpdateUserInputDto,
  ): Promise<UpdateUserResponseDto> {
    return this.updateUserService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );
  }
}
