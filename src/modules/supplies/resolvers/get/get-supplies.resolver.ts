import { Args, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { buildPaginatedListResponse } from "../../../../common/responses/helpers/response.helper";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { GetSuppliesInputDto } from "../../dtos/get/get-supplies-input.dto";
import { GetSuppliesListResponseDto } from "../../dtos/get/get-supplies-list-response.dto";
import { GetSuppliesService } from "../../services/get/get-supplies.service";

@Resolver(() => GetSuppliesListResponseDto)
export class GetSuppliesResolver {
  constructor(private readonly getSuppliesService: GetSuppliesService) {}

  @Query(() => GetSuppliesListResponseDto, {
    name: "getSupplies",
  })
  @RequirePermissions(AuthPermission.READ_BUDGETS)
  async getSupplies(
    @CurrentUser() user: unknown,
    @Args("input", { nullable: true }) input?: GetSuppliesInputDto,
  ) {
    const result = await this.getSuppliesService.findAll(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildPaginatedListResponse(
      result,
      RESPONSE_MESSAGES.supplies.listed,
    );
  }
}
