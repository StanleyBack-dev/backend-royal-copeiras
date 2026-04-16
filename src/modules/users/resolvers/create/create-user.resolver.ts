import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import {
  RequestInfo,
  type IRequestInfo,
} from "../../../../common/decorators/request-info.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { CreateUserInputDto } from "../../dtos/create/create-user-input.dto";
import { CreateUserResponseDto } from "../../dtos/create/create-user-response.dto";
import { CreateUserService } from "../../services/create/create-user.service";

@Resolver(() => CreateUserResponseDto)
export class CreateUserResolver {
  constructor(private readonly createUserService: CreateUserService) {}

  @RequirePermissions(AuthPermission.MANAGE_USERS)
  @Mutation(() => CreateUserResponseDto, { name: "createUser" })
  async createUser(
    @CurrentUser() user: unknown,
    @Args("input") input: CreateUserInputDto,
    @RequestInfo() requestInfo: IRequestInfo,
  ): Promise<CreateUserResponseDto> {
    return this.createUserService.execute(
      (user as { idUsers: string }).idUsers,
      input,
      requestInfo,
    );
  }
}
