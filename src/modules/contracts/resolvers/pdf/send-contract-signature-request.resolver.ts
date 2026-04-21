import { Args, Field, InputType, Mutation, Resolver } from "@nestjs/graphql";
import { IsUUID } from "class-validator";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { SuccessResponseDto } from "../../../../common/responses/dtos/success-response.dto";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { buildSuccessResponse } from "../../../../common/responses/helpers/response.helper";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { SendContractSignatureRequestService } from "../../services/pdf/send-contract-signature-request.service";

@InputType()
export class SendContractSignatureRequestInputDto {
  @Field()
  @IsUUID()
  idContracts!: string;
}

@Resolver(() => SuccessResponseDto)
export class SendContractSignatureRequestResolver {
  constructor(
    private readonly sendContractSignatureRequestService: SendContractSignatureRequestService,
  ) {}

  @Mutation(() => SuccessResponseDto, {
    name: "sendContractSignatureRequest",
  })
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async sendContractSignatureRequest(
    @CurrentUser() user: unknown,
    @Args("input") input: SendContractSignatureRequestInputDto,
  ) {
    await this.sendContractSignatureRequestService.execute(
      (user as { idUsers: string }).idUsers,
      { idContracts: input.idContracts },
    );

    return buildSuccessResponse(RESPONSE_MESSAGES.contracts.signatureRequested);
  }
}
