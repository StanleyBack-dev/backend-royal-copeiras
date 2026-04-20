import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { GenerateContractPreviewInputDto } from "../../dtos/pdf/generate-contract-preview-input.dto";
import { GenerateContractPreviewMutationResponseDto } from "../../dtos/pdf/generate-contract-preview-mutation-response.dto";
import { GenerateContractPreviewPdfService } from "../../services/pdf/generate-contract-preview-pdf.service";

@Resolver(() => GenerateContractPreviewMutationResponseDto)
export class GenerateContractPreviewResolver {
  constructor(
    private readonly generateContractPreviewPdfService: GenerateContractPreviewPdfService,
  ) {}

  @Mutation(() => GenerateContractPreviewMutationResponseDto, {
    name: "generateContractPreviewPdf",
  })
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async generateContractPreviewPdf(
    @CurrentUser() user: unknown,
    @Args("input") input: GenerateContractPreviewInputDto,
  ) {
    const data = await this.generateContractPreviewPdfService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(
      data,
      RESPONSE_MESSAGES.contracts.previewGenerated,
    );
  }
}
