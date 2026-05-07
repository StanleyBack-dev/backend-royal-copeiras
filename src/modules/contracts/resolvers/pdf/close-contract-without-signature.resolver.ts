import { Args, Field, InputType, Mutation, Resolver } from "@nestjs/graphql";
import { IsUUID } from "class-validator";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { SuccessResponseDto } from "../../../../common/responses/dtos/success-response.dto";
import { buildSuccessResponse } from "../../../../common/responses/helpers/response.helper";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { CloseContractWithoutSignatureService } from "../../services/pdf/close-contract-without-signature.service";

@InputType()
export class CloseContractWithoutSignatureInputDto {
  @Field()
  @IsUUID()
  idContracts!: string;
}

@Resolver(() => SuccessResponseDto)
export class CloseContractWithoutSignatureResolver {
  constructor(
    private readonly closeContractWithoutSignatureService: CloseContractWithoutSignatureService,
  ) {}

  @Mutation(() => SuccessResponseDto, {
    name: "closeContractWithoutSignature",
  })
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async closeContractWithoutSignature(
    @CurrentUser() user: unknown,
    @Args("input") input: CloseContractWithoutSignatureInputDto,
  ) {
    await this.closeContractWithoutSignatureService.execute(
      (user as { idUsers: string }).idUsers,
      { idContracts: input.idContracts },
    );

    return buildSuccessResponse(
      RESPONSE_MESSAGES.contracts.closedWithoutSignature,
    );
  }
}
