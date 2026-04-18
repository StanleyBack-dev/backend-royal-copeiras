import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CreateBudgetsService } from "../../services/create/create-budgets.service";
import { CreateBudgetsInputDto } from "../../dtos/create/create-budgets-input.dto";
import { CreateBudgetsMutationResponseDto } from "../../dtos/create/create-budgets-mutation-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";

@Resolver(() => CreateBudgetsMutationResponseDto)
export class CreateBudgetsResolver {
  constructor(private readonly createBudgetsService: CreateBudgetsService) {}

  @Mutation(() => CreateBudgetsMutationResponseDto, {
    name: "createBudgets",
  })
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async createBudgets(
    @CurrentUser() user: unknown,
    @Args("input") input: CreateBudgetsInputDto,
  ) {
    const budget = await this.createBudgetsService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(budget, RESPONSE_MESSAGES.budgets.created);
  }
}
