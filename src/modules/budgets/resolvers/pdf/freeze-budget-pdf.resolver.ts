import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { FreezeBudgetPdfInputDto } from "../../dtos/pdf/freeze-budget-pdf-input.dto";
import { FreezeBudgetPdfMutationResponseDto } from "../../dtos/pdf/freeze-budget-pdf-mutation-response.dto";
import { FreezeBudgetPdfService } from "../../services/pdf/freeze-budget-pdf.service";

@Resolver(() => FreezeBudgetPdfMutationResponseDto)
export class FreezeBudgetPdfResolver {
  constructor(
    private readonly freezeBudgetPdfService: FreezeBudgetPdfService,
  ) {}

  @Mutation(() => FreezeBudgetPdfMutationResponseDto, {
    name: "freezeBudgetPdf",
  })
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async freezeBudgetPdf(
    @CurrentUser() user: unknown,
    @Args("input") input: FreezeBudgetPdfInputDto,
  ) {
    const data = await this.freezeBudgetPdfService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(data, RESPONSE_MESSAGES.budgets.frozen);
  }
}
