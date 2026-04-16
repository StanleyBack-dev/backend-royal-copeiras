import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { CreateCustomersService } from "../../services/create/create-customers.service";
import { CreateCustomersInputDto } from "../../dtos/create/create-customers-input.dto";
import { CreateCustomersResponseDto } from "../../dtos/create/create-customers-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";

@Resolver(() => CreateCustomersResponseDto)
export class CreateCustomersResolver {
  constructor(
    private readonly createCustomersService: CreateCustomersService,
  ) {}

  @Mutation(() => CreateCustomersResponseDto, { name: "createCustomers" })
  @RequirePermissions(AuthPermission.MANAGE_CUSTOMERS)
  async createCustomers(
    @CurrentUser() user: unknown,
    @Args("input") input: CreateCustomersInputDto,
  ): Promise<CreateCustomersResponseDto> {
    return this.createCustomersService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    ) as unknown as CreateCustomersResponseDto;
  }
}
