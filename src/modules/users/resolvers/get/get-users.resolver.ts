import { Resolver, Query, Args } from "@nestjs/graphql";
import { GetUsersService } from "../../services/get/get-users.service";
import { GetUserInputDto } from "../../dtos/get/get-user-input.dto";
import { GetUsersInputDto } from "../../dtos/get/get-users-input.dto";
import { GetUsersListResponseDto } from "../../dtos/get/get-users-list-response.dto";
import { GetUserResponseDto } from "../../dtos/get/get-user-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { AllowFirstAccess } from "../../../auth/decorators/allow-first-access.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { buildPaginatedListResponse } from "../../../../common/responses/helpers/response.helper";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";

@Resolver()
export class GetUsersResolver {
  constructor(private readonly getUsersService: GetUsersService) {}

  @Query(() => GetUsersListResponseDto, { name: "getUsers" })
  @RequirePermissions(AuthPermission.READ_USERS)
  async getUsers(
    @CurrentUser() user: unknown,
    @Args("input", { nullable: true }) input?: GetUsersInputDto,
  ) {
    const result = await this.getUsersService.findAll(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildPaginatedListResponse(result, RESPONSE_MESSAGES.users.listed);
  }

  @Query(() => GetUserResponseDto, { name: "getUser" })
  @RequirePermissions(AuthPermission.READ_USERS)
  async getUser(
    @CurrentUser() user: unknown,
    @Args("input") input: GetUserInputDto,
  ): Promise<GetUserResponseDto> {
    return GetUserResponseDto.fromEntity(
      await this.getUsersService.findOne(
        (user as { idUsers: string }).idUsers,
        input,
      ),
    );
  }

  @Query(() => GetUserResponseDto, { name: "me" })
  @AllowFirstAccess()
  @RequirePermissions(AuthPermission.READ_OWN_USER)
  async me(@CurrentUser() user: unknown): Promise<GetUserResponseDto> {
    return GetUserResponseDto.fromEntity(
      await this.getUsersService.findByIdOrFail(
        (user as { idUsers: string }).idUsers,
      ),
    );
  }
}
