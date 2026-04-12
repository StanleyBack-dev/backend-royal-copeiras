import { Resolver, Query, Args } from "@nestjs/graphql";
import { GetCustomersService } from "../../services/get/get-customers.service";
import { GetCustomersInputDto } from "../../dtos/get/get-customers-input.dto";
import { GetCustomersResponseDto } from "../../dtos/get/get-customers-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";

@Resolver(() => GetCustomersResponseDto)
export class GetCustomersResolver {
  constructor(private readonly getCustomersService: GetCustomersService) {}

  @Query(() => [GetCustomersResponseDto], { name: "getCustomers" })
  async getCustomers(
    @CurrentUser() user: unknown,
    @Args("input", { nullable: true }) input?: GetCustomersInputDto,
  ): Promise<GetCustomersResponseDto[]> {
    return this.getCustomersService.findAll(
      (user as { idUsers: string }).idUsers,
      input,
    ) as unknown as GetCustomersResponseDto[];
  }
}
