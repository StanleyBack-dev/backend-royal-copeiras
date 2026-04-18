import { Args, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { DownloadBudgetPdfInputDto } from "../../dtos/pdf/download-budget-pdf-input.dto";
import { DownloadBudgetPdfQueryResponseDto } from "../../dtos/pdf/download-budget-pdf-query-response.dto";
import { DownloadBudgetPdfService } from "../../services/pdf/download-budget-pdf.service";

@Resolver(() => DownloadBudgetPdfQueryResponseDto)
export class DownloadBudgetPdfResolver {
  constructor(
    private readonly downloadBudgetPdfService: DownloadBudgetPdfService,
  ) {}

  @Query(() => DownloadBudgetPdfQueryResponseDto, {
    name: "downloadBudgetPdf",
  })
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async downloadBudgetPdf(
    @CurrentUser() user: unknown,
    @Args("input") input: DownloadBudgetPdfInputDto,
  ) {
    const data = await this.downloadBudgetPdfService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(data, RESPONSE_MESSAGES.budgets.downloaded);
  }
}
