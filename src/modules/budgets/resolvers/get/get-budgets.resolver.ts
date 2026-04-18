import { Args, Query, Resolver } from "@nestjs/graphql";
import { GetBudgetsService } from "../../services/get/get-budgets.service";
import { GetBudgetsInputDto } from "../../dtos/get/get-budgets-input.dto";
import { GetBudgetsListResponseDto } from "../../dtos/get/get-budgets-list-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { buildPaginatedListResponse } from "../../../../common/responses/helpers/response.helper";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";

@Resolver(() => GetBudgetsListResponseDto)
export class GetBudgetsResolver {
  constructor(private readonly getBudgetsService: GetBudgetsService) {}

  @Query(() => GetBudgetsListResponseDto, { name: "getBudgets" })
  @RequirePermissions(AuthPermission.READ_BUDGETS)
  async getBudgets(
    @CurrentUser() user: unknown,
    @Args("input", { nullable: true }) input?: GetBudgetsInputDto,
  ) {
    const budgets = await this.getBudgetsService.findAll(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildPaginatedListResponse(
      budgets,
      RESPONSE_MESSAGES.budgets.listed,
    );
  }
}
