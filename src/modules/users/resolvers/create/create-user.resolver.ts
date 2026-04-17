import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import {
  RequestInfo,
  type IRequestInfo,
} from "../../../../common/decorators/request-info.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { CreateUserInputDto } from "../../dtos/create/create-user-input.dto";
import { CreateUserMutationResponseDto } from "../../dtos/create/create-user-mutation-response.dto";
import { CreateUserService } from "../../services/create/create-user.service";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";

@Resolver(() => CreateUserMutationResponseDto)
export class CreateUserResolver {
  constructor(private readonly createUserService: CreateUserService) {}

  @RequirePermissions(AuthPermission.MANAGE_USERS)
  @Mutation(() => CreateUserMutationResponseDto, { name: "createUser" })
  async createUser(
    @CurrentUser() user: unknown,
    @Args("input") input: CreateUserInputDto,
    @RequestInfo() requestInfo: IRequestInfo,
  ) {
    const createdUser = await this.createUserService.execute(
      (user as { idUsers: string }).idUsers,
      input,
      requestInfo,
    );

    return buildDataResponse(
      createdUser,
      RESPONSE_MESSAGES.users.created,
    );
  }
}
