import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { AllowFirstAccess } from "../../../auth/decorators/allow-first-access.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { GetUserPagePermissionsInputDto } from "../../dtos/permissions/get-user-page-permissions-input.dto";
import { SetUserPagePermissionsInputDto } from "../../dtos/permissions/set-user-page-permissions-input.dto";
import { SetUserPagePermissionsMutationResponseDto } from "../../dtos/permissions/set-user-page-permissions-mutation-response.dto";
import { UserPagePermissionsResponseDto } from "../../dtos/permissions/user-page-permissions-response.dto";
import { UserPageAccessService } from "../../services/permissions/user-page-access.service";

@Resolver()
export class UserPagePermissionsResolver {
  constructor(private readonly userPageAccessService: UserPageAccessService) {}

  @Query(() => UserPagePermissionsResponseDto, {
    name: "getUserPagePermissions",
  })
  @RequirePermissions(AuthPermission.MANAGE_USERS)
  async getUserPagePermissions(
    @CurrentUser() user: unknown,
    @Args("input") input: GetUserPagePermissionsInputDto,
  ): Promise<UserPagePermissionsResponseDto> {
    return this.userPageAccessService.getByUserIdManaged(
      (user as { idUsers: string }).idUsers,
      input.idUsers,
    );
  }

  @Query(() => UserPagePermissionsResponseDto, { name: "getMyPagePermissions" })
  @AllowFirstAccess()
  @RequirePermissions(AuthPermission.READ_OWN_USER)
  async getMyPagePermissions(
    @CurrentUser() user: unknown,
  ): Promise<UserPagePermissionsResponseDto> {
    return this.userPageAccessService.getByUserId(
      (user as { idUsers: string }).idUsers,
    );
  }

  @Mutation(() => SetUserPagePermissionsMutationResponseDto)
  @RequirePermissions(AuthPermission.MANAGE_USERS)
  async setUserPagePermissions(
    @CurrentUser() user: unknown,
    @Args("input") input: SetUserPagePermissionsInputDto,
  ) {
    const result = await this.userPageAccessService.setForUser(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(
      result,
      RESPONSE_MESSAGES.users.permissionsUpdated,
    );
  }
}
