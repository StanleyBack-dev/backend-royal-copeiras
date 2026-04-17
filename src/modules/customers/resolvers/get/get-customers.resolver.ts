import { Resolver, Query, Args } from "@nestjs/graphql";
import { GetCustomersService } from "../../services/get/get-customers.service";
import { GetCustomersInputDto } from "../../dtos/get/get-customers-input.dto";
import { GetCustomersListResponseDto } from "../../dtos/get/get-customers-list-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { buildPaginatedListResponse } from "../../../../common/responses/helpers/response.helper";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";

@Resolver(() => GetCustomersListResponseDto)
export class GetCustomersResolver {
  constructor(private readonly getCustomersService: GetCustomersService) {}

  @Query(() => GetCustomersListResponseDto, { name: "getCustomers" })
  @RequirePermissions(AuthPermission.READ_CUSTOMERS)
  async getCustomers(
    @CurrentUser() user: unknown,
    @Args("input", { nullable: true }) input?: GetCustomersInputDto,
  ) {
    const customers = await this.getCustomersService.findAll(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildPaginatedListResponse(
      customers,
      RESPONSE_MESSAGES.customers.listed,
    );
  }
}
