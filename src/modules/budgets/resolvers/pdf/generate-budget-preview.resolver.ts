import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { GenerateBudgetPreviewInputDto } from "../../dtos/pdf/generate-budget-preview-input.dto";
import { GenerateBudgetPreviewMutationResponseDto } from "../../dtos/pdf/generate-budget-preview-mutation-response.dto";
import { GenerateBudgetPreviewPdfService } from "../../services/pdf/generate-budget-preview-pdf.service";

@Resolver(() => GenerateBudgetPreviewMutationResponseDto)
export class GenerateBudgetPreviewResolver {
  constructor(
    private readonly generateBudgetPreviewPdfService: GenerateBudgetPreviewPdfService,
  ) {}

  @Mutation(() => GenerateBudgetPreviewMutationResponseDto, {
    name: "generateBudgetPreviewPdf",
  })
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async generateBudgetPreviewPdf(
    @CurrentUser() user: unknown,
    @Args("input") input: GenerateBudgetPreviewInputDto,
  ) {
    const data = await this.generateBudgetPreviewPdfService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(data, RESPONSE_MESSAGES.budgets.previewGenerated);
  }
}
