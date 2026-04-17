import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { CreateCustomersService } from "../../services/create/create-customers.service";
import { CreateCustomersInputDto } from "../../dtos/create/create-customers-input.dto";
import { CreateCustomersMutationResponseDto } from "../../dtos/create/create-customers-mutation-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";

@Resolver(() => CreateCustomersMutationResponseDto)
export class CreateCustomersResolver {
  constructor(
    private readonly createCustomersService: CreateCustomersService,
  ) {}

  @Mutation(() => CreateCustomersMutationResponseDto, { name: "createCustomers" })
  @RequirePermissions(AuthPermission.MANAGE_CUSTOMERS)
  async createCustomers(
    @CurrentUser() user: unknown,
    @Args("input") input: CreateCustomersInputDto,
  ) {
    const customer = await this.createCustomersService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(
      customer,
      RESPONSE_MESSAGES.customers.created,
    );
  }
}
