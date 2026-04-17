import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { UpdateCustomersService } from "../../services/update/update-customers.service";
import { UpdateCustomersInputDto } from "../../dtos/update/update-customers-input.dto";
import { UpdateCustomersMutationResponseDto } from "../../dtos/update/update-customers-mutation-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";

@Resolver(() => UpdateCustomersMutationResponseDto)
export class UpdateCustomersResolver {
  constructor(
    private readonly updateCustomersService: UpdateCustomersService,
  ) {}

  @Mutation(() => UpdateCustomersMutationResponseDto, { name: "updateCustomers" })
  @RequirePermissions(AuthPermission.MANAGE_CUSTOMERS)
  async updateCustomers(
    @CurrentUser() user: unknown,
    @Args("input") input: UpdateCustomersInputDto,
  ) {
    const customer = await this.updateCustomersService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(
      customer,
      RESPONSE_MESSAGES.customers.updated,
    );
  }
}
