import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { UpdateBudgetsService } from "../../services/update/update-budgets.service";
import { UpdateBudgetsInputDto } from "../../dtos/update/update-budgets-input.dto";
import { UpdateBudgetsMutationResponseDto } from "../../dtos/update/update-budgets-mutation-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";

@Resolver(() => UpdateBudgetsMutationResponseDto)
export class UpdateBudgetsResolver {
  constructor(private readonly updateBudgetsService: UpdateBudgetsService) {}

  @Mutation(() => UpdateBudgetsMutationResponseDto, {
    name: "updateBudgets",
  })
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async updateBudgets(
    @CurrentUser() user: unknown,
    @Args("input") input: UpdateBudgetsInputDto,
  ) {
    const budget = await this.updateBudgetsService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(budget, RESPONSE_MESSAGES.budgets.updated);
  }
}
