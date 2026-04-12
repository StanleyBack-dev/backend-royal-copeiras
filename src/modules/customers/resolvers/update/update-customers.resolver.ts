import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { UpdateCustomersService } from "../../services/update/update-customers.service";
import { UpdateCustomersInputDto } from "../../dtos/update/update-customers-input.dto";
import { UpdateCustomersResponseDto } from "../../dtos/update/update-customers-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";

@Resolver(() => UpdateCustomersResponseDto)
export class UpdateCustomersResolver {
  constructor(
    private readonly updateCustomersService: UpdateCustomersService,
  ) {}

  @Mutation(() => UpdateCustomersResponseDto, { name: "updateCustomers" })
  async updateCustomers(
    @CurrentUser() user: unknown,
    @Args("input") input: UpdateCustomersInputDto,
  ): Promise<UpdateCustomersResponseDto> {
    return this.updateCustomersService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );
  }
}
