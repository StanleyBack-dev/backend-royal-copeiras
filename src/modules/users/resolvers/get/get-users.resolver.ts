import { Resolver, Query, Args } from "@nestjs/graphql";
import { GetUsersService } from "../../services/get/get-users.service";
import { GetUserInputDto } from "../../dtos/get/get-user-input.dto";
import { GetUserResponseDto } from "../../dtos/get/get-user-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { AllowFirstAccess } from "../../../auth/decorators/allow-first-access.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";

@Resolver()
export class GetUsersResolver {
  constructor(private readonly getUsersService: GetUsersService) {}

  @Query(() => [GetUserResponseDto], { name: "getUsers" })
  @RequirePermissions(AuthPermission.READ_USERS)
  async getUsers(@CurrentUser() user: unknown): Promise<GetUserResponseDto[]> {
    // Remove campos não existentes do retorno
    return (
      await this.getUsersService.findAll((user as { idUsers: string }).idUsers)
    ).map(
      ({
        idUsers,
        name,
        email,
        urlAvatar,
        status,
        group,
        inactivatedAt,
        createdAt,
        updatedAt,
      }) => ({
        idUsers,
        name,
        email,
        urlAvatar,
        status,
        group,
        inactivatedAt,
        createdAt,
        updatedAt,
      }),
    );
  }

  @Query(() => GetUserResponseDto, { name: "getUser" })
  @RequirePermissions(AuthPermission.READ_USERS)
  async getUser(
    @CurrentUser() user: unknown,
    @Args("input") input: GetUserInputDto,
  ): Promise<GetUserResponseDto> {
    const {
      idUsers,
      name,
      email,
      urlAvatar,
      status,
      group,
      inactivatedAt,
      createdAt,
      updatedAt,
    } = await this.getUsersService.findOne(
      (user as { idUsers: string }).idUsers,
      input,
    );
    return {
      idUsers,
      name,
      email,
      urlAvatar,
      status,
      group,
      inactivatedAt,
      createdAt,
      updatedAt,
    };
  }

  @Query(() => GetUserResponseDto, { name: "me" })
  @AllowFirstAccess()
  @RequirePermissions(AuthPermission.READ_OWN_USER)
  async me(@CurrentUser() user: unknown): Promise<GetUserResponseDto> {
    const {
      idUsers,
      name,
      email,
      urlAvatar,
      status,
      group,
      inactivatedAt,
      createdAt,
      updatedAt,
    } = await this.getUsersService.findByIdOrFail(
      (user as { idUsers: string }).idUsers,
    );
    return {
      idUsers,
      name,
      email,
      urlAvatar,
      status,
      group,
      inactivatedAt,
      createdAt,
      updatedAt,
    };
  }
}
