import { UseGuards } from "@nestjs/common";
import { Resolver, Query, Args } from "@nestjs/graphql";
import { GetUsersService } from "../../services/get/get-users.service";
import { GetUserInputDto } from "../../dtos/get/get-user-input.dto";
import { GetUserResponseDto } from "../../dtos/get/get-user-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";

@Resolver()
export class GetUsersResolver {
  constructor(private readonly getUsersService: GetUsersService) { }

  @Query(() => [GetUserResponseDto], { name: "getUsers" })
  async getUsers(): Promise<GetUserResponseDto[]> {
    // Remove campos não existentes do retorno
    return (await this.getUsersService.findAll()).map(({ idUsers, name, email, urlAvatar, status, inactivatedAt, createdAt, updatedAt }) => ({
      idUsers, name, email, urlAvatar, status, inactivatedAt, createdAt, updatedAt
    }));
  }

  @Query(() => GetUserResponseDto, { name: "getUser" })
  async getUser(
    @Args("input") input: GetUserInputDto
  ): Promise<GetUserResponseDto> {
    const { idUsers, name, email, urlAvatar, status, inactivatedAt, createdAt, updatedAt } = await this.getUsersService.findOne(input);
    return { idUsers, name, email, urlAvatar, status, inactivatedAt, createdAt, updatedAt };
  }

  @Query(() => GetUserResponseDto, { name: "me" })
  async me(@CurrentUser() user: any): Promise<GetUserResponseDto> {
    const { idUsers, name, email, urlAvatar, status, inactivatedAt, createdAt, updatedAt } = await this.getUsersService.findOne({ idUsers: user.idUsers });
    return { idUsers, name, email, urlAvatar, status, inactivatedAt, createdAt, updatedAt };
  }
}